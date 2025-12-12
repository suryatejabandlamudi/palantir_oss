import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, description, nodes, edges } = body;

        // 1. Create the Pipeline Record
        const pipeline = await prisma.agentPipeline.create({
            data: {
                title: title || "Untitled Pipeline",
                description: description || "Created via The Forge",
                active: true,
            }
        });

        // 2. Create Nodes
        // We iterate and create them. For agents, we might need to create Agent records too 
        // depending on how the frontend sends data. For now, assuming embedded config.
        for (const node of nodes) {
            let agentId = undefined;

            // If it's an Agent node, lets see if we need to create/link an Agent
            if (node.data.type === 'AGENT') {
                // Check if agent exists or create new transient agent for this pipeline
                const agent = await prisma.agent.create({
                    data: {
                        name: node.data.label,
                        role: node.data.role || "Generalist",
                        model: node.data.model || "GEMINI_PRO_1_5",
                        systemPrompt: node.data.systemPrompt || "You are a helpful agent.",
                        temperature: node.data.temperature || 0.7
                    }
                });
                agentId = agent.id;
            }

            await prisma.pipelineNode.create({
                data: {
                    pipelineId: pipeline.id,
                    type: node.type === 'input' ? 'TRIGGER' : (node.data.type || 'TOOL'),
                    label: node.data.label,
                    agentId: agentId,
                    toolId: node.data.toolId, // if tool
                    positionX: node.position.x,
                    positionY: node.position.y,
                    config: JSON.stringify(node.data)
                }
            });
        }

        // 3. Create Edges
        for (const edge of edges) {
            await prisma.pipelineEdge.create({
                data: {
                    pipelineId: pipeline.id,
                    source: edge.source,
                    target: edge.target,
                    label: edge.label
                }
            });
        }

        return NextResponse.json({ success: true, pipelineId: pipeline.id });

    } catch (error) {
        console.error("Deploy Error:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
