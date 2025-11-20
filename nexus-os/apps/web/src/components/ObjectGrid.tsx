'use client';

import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Using Alpine theme as base, customized via CSS

export default function ObjectGrid({ data, onRowClick }: any) {
    const columnDefs = useMemo<ColDef[]>(() => {
        if (!data || data.length === 0) return [];

        // Flatten properties for grid
        const sample = data[0];
        const cols: ColDef[] = [
            { field: 'title', headerName: 'Title', pinned: 'left', width: 200, filter: true, sortable: true }
        ];

        if (sample.properties) {
            Object.keys(sample.properties).forEach(key => {
                cols.push({
                    field: `properties.${key}`,
                    headerName: key.charAt(0).toUpperCase() + key.slice(1),
                    filter: true,
                    sortable: true,
                    resizable: true
                });
            });
        }

        return cols;
    }, [data]);

    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        resizable: true,
        floatingFilter: true,
    }), []);

    return (
        <div className="ag-theme-alpine-dark h-full w-full">
            <AgGridReact
                rowData={data}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                onRowClicked={(e) => onRowClick && onRowClick(e.data)}
                animateRows={true}
                rowSelection="single"
            />
        </div>
    );
}
