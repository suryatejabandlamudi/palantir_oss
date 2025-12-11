Surya — “every detail” isn’t possible from the outside. A lot of what you’re asking for (internal org chart, exact hierarchy by team, the full supplier list by part number, logistics contracts/routes, cycle-time per model, which internal tools are used where, etc.) is proprietary and changes constantly.

What I *can* do is give you an end-to-end, fairly deep map of Tesla using **public, citable sources**, and I’ll clearly label what’s **known vs. not publicly disclosed**.

---

## Tesla in one page

Tesla reports **two segments**: **Automotive** and **Energy Generation & Storage**. ([SEC][1])
They design/develop/manufacture/sell/lease EVs and energy products, and they generally **sell directly to customers** (website + company-owned stores), while operating a global network of service centers, mobile service, body shops, Superchargers, etc. ([SEC][1])

**Vehicles (consumer):** Model 3, Y, S, X, Cybertruck; also “early production and deliveries” of Tesla Semi (commercial). ([SEC][1])
**Energy:** Powerwall (residential storage), Megapack (grid-scale storage), solar products (incl. Solar Roof). ([SEC][1])

---

## Headcount and workforce programs

As of **Dec 31, 2024**, Tesla reports **125,665 employees worldwide**. ([SEC][1])

They also describe internal programs like internships (~4,000/year), apprenticeships, technician training, education assistance, and internal promotion stats (example: 68% of managers promoted from non-manager roles). ([SEC][1])

---

## Publicly visible hierarchy and “orgs”

### What’s actually public

From SEC filings, you can reliably anchor on:

* **Board of Directors** (named in the 10-K signatures)
* **CEO:** Elon Musk
* **CFO:** Vaibhav Taneja ([SEC][1])

Tesla **does not** publish a detailed internal org chart (e.g., “how many orgs,” “who reports to whom,” “which org owns which system”) in a way you can treat as authoritative.

### A practical (external) org map that fits what Tesla discloses

Based on Tesla’s segment reporting + how the business operates, a reasonable top-level “org” decomposition looks like:

**A) Automotive segment** ([SEC][1])

* Vehicle engineering (mechanical, electrical, firmware, controls, crash/safety, etc.)
* Battery + powertrain engineering/manufacturing
* Manufacturing ops (factories, industrial engineering, automation)
* Supply chain & procurement (direct + tier-1 management)
* Sales, delivery, service, collision, parts
* Charging (Supercharger network + associated ops)
* Autopilot / FSD (Supervised) software & AI

**B) Energy Generation & Storage segment** ([SEC][1])

* Megapack (product + factory + project delivery)
* Powerwall + residential distribution/partners
* Solar (sourcing, manufacturing of some components, installation/channel partners)

**C) Corporate / enabling functions**

* Finance/accounting, HR, legal, IT/security, facilities, ESG, etc.

That’s not Tesla’s internal org chart — it’s an accurate **external model** aligned to how they report the business.

---

## Where Tesla makes what

Tesla lists major owned/operated manufacturing sites and what they build. Key examples:

* **Fremont Factory (CA):** assembles **Model S/3/X/Y**. ([SEC][1])
* **Gigafactory Nevada (Sparks, NV):** makes/supplies **battery cells & packs**, **drive units/powertrains**, supports **Tesla Semi**; also energy products. ([SEC][1])
* **Gigafactory New York (Buffalo, NY):** solar/energy manufacturing (e.g., solar panels/roof-related). ([SEC][1])
* **Gigafactory Texas (Austin, TX):** **Model Y + Cybertruck** and also battery packs/components. ([SEC][1])
* **Megafactory Lathrop (CA):** **Megapack** production. ([SEC][1])
* **Gigafactory Shanghai (China):** **Model 3 + Model Y**. ([SEC][1])
* **Gigafactory Berlin-Brandenburg (Germany):** **Model Y**. ([SEC][1])
* **Megafactory Shanghai (China):** **Megapack**. ([SEC][1])

Tesla also notes expansion and localization: international manufacturing helps reduce transportation costs and tariffs. ([SEC][1])

---

## End-to-end vehicle lifecycle

### 1) Design & engineering

Tesla emphasizes in-house design/test engineering, simulation, and manufacturing engineering (stamping/casting/thermal). It explicitly calls out innovations like **large castings** and integrating batteries more directly with body structures to optimize manufacturability/weight/cost. ([SEC][1])

### 2) Sourcing & supplier management

Tesla states its products use **thousands of parts** from **hundreds of suppliers worldwide**, with close relationships for key parts like **battery cells, electronics, complex assemblies**. ([SEC][1])
They also note:

* Some components can be **single-sourced** (risk)
* They try to **qualify multiple suppliers** where sensible
* They use **safety stock** and **die banks** for long lead-time components ([SEC][1])

They also call out exposure to commodity raw materials like **aluminum, steel, cobalt, lithium, nickel, copper**, and the use of long-term contracts where feasible. ([SEC][1])

### 3) Manufacturing (high-level flow)

Tesla doesn’t publish a step-by-step factory routing, but the industry-standard flow (and consistent with Tesla’s described capabilities) is:

1. **Inbound logistics**: parts arrive to factory warehouses / line-side supermarkets
2. **Stamping / casting** (body structural parts)
3. **Body shop**: weld/adhesive/robot joining to build body-in-white
4. **Paint shop**
5. **Drive unit + battery pack** production (some in-house, some integrated from suppliers) ([SEC][1])
6. **General assembly**: interior, glass, harnesses, seats, thermal systems, suspension
7. **Software flashing + calibration**
8. **End-of-line testing** (leak, torque audits, electrical test, alignment, road test sampling)
9. **Outbound staging**: rail/truck/ship depending on destination

Tesla specifically highlights building capabilities in **automation, die-making, and line-building**, and using simulation before construction. ([SEC][1])

### 4) Delivery & customer handoff

Tesla’s public process is app-driven:

* You order via Tesla website and pay a **one-time, non-refundable order fee**. ([Tesla][2])
* Once the vehicle is available/assigned, Tesla sends messages and you schedule a delivery appointment. Delivery timing varies by **production + logistics + completion of delivery tasks**. ([Tesla][3])

### 5) After-sales: service + software

Tesla services vehicles through **company-owned service locations** and **mobile service**, and can diagnose/remedy some issues remotely because vehicles are connected and updated OTA. ([SEC][1])

---

## How Tesla ships vehicles and parts

### What’s public and reliable

* Tesla explicitly frames local manufacturing (China, Germany) as a way to reduce **transportation cost** and tariff impacts. ([SEC][1])
* It acknowledges real-world logistics disruptions (example: shipping routes affected by Red Sea conflict, causing re-routing and longer transit times). ([SEC][1])
* Battery packs are regulated as **dangerous goods** for transport; Tesla notes compliance testing and that batteries are regulated for use/storage/disposal. ([SEC][1])

### What isn’t public

Tesla does **not** publish:

* Which ocean carrier, rail operator, or trucking carriers are used where
* Exact port routing / VIN-level shipping status logic
* Warehouse locations and inventory policies by part

So any “exact shipping playbook” you see online is usually inference, not something you can verify.

---

## Where parts come from: what you can and can’t know

### What Tesla itself says (high confidence)

* **Hundreds of suppliers**, global sourcing, some single-source risk, multi-sourcing where feasible. ([SEC][1])
* Raw materials include aluminum/steel/cobalt/lithium/nickel/copper. ([SEC][1])
* Tesla has **battery recycling agreements with third-party recyclers** and is piloting its own recycling technology. ([SEC][1])

### Examples of specific supply relationships (publicly documented)

One concrete example: **Piedmont Lithium** amended a supply deal under which it would deliver about **125,000 metric tons of spodumene concentrate** to Tesla beginning in 2H 2023 through **end of 2025** (per Reuters). ([Reuters][4])

Beyond a handful of deals like this, Tesla generally does **not** disclose the full BOM-to-supplier mapping (and it varies by factory + model + trim + time).

---

## Pricing: how Tesla prices and what it is right now

Tesla pricing is **dynamic** (it changes frequently by region, inventory, and incentives). The cleanest “source of truth” is Tesla’s own configurator pages.

As of the current U.S. configurators:

* **Model 3**: Vehicle Price **$36,990** + Destination **$1,390** + Order Fee **$250** ([Tesla][5])
* **Model Y**: Vehicle Price **$39,990** + Destination **$1,390** + Order Fee **$250** ([Tesla][6])
* **Model S**: Vehicle Price **$94,990** + Destination **$1,390** + Order Fee **$250** ([Tesla][7])
* **Model X**: Vehicle Price **$99,990** + Destination **$1,390** + Order Fee **$250** ([Tesla][8])
* **Cybertruck**: Vehicle Price **$79,990** + Destination **$1,995** + Order Fee **$250** ([Tesla][9])

Those figures are **before** taxes/registration and depend on options/trim.

---

## Manufacturing time per model

This is one of your requests I can’t truthfully answer with “full details”:

* Tesla does **not** publish a credible, official “hours per car” by model, factory, and trim.
* What they do publish (publicly) is more about **capacity, production volume, and efficiency initiatives**, not a per-model manufacturing lead time breakdown.

What *is* reasonable to say (qualitative, not exact):

* **Model 3/Y** are high-volume designs optimized for manufacturability.
* **Model S/X** are lower-volume, higher-variant, more complex builds (generally more labor hours per unit in any automaker).
* **Cybertruck** being newer + unique materials/processes typically implies more manufacturing variability early in ramp.

But exact times? Not public.

---

## Internal tools: Workday, SAP, Salesforce, ServiceNow, IT tickets

You asked very specifically about internal systems (Workday, Salesforce, SAP, ServiceNow, IT tickets). Tesla doesn’t publish an “IT architecture diagram,” but you *can* infer some tooling from job postings.

Here’s what is **documented** in postings (with caveats):

* A Tesla HR Operations role on LinkedIn listed “familiarity with… **Workday** and **Kronos**” as a plus (note: this posting is **9 years old**, so it’s historical evidence, not guaranteed current state). ([LinkedIn][10])
* A Tesla **Salesforce Developer** role on LinkedIn (also **9 years old**) explicitly references Salesforce development/APIs and integrations. ([LinkedIn][11])
* Tesla service/parts roles have referenced **SAP** among “DMS systems/ERP” skills (this suggests SAP usage in parts/inventory/service operations somewhere in the org). ([Tesla][12])
* A Tesla IT Asset Management role listed experience with ticketing/asset tools like **ServiceNow ITSM** or BMC Remedy as preferred (this indicates they operate in that ITSM/tooling ecosystem, but it still doesn’t prove “Tesla runs ServiceNow globally”). ([Tesla][13])

So the honest answer is:

* **SAP**: evidence suggests usage in at least some operational workflows (parts/service/inventory). ([Tesla][12])
* **Workday/Kronos**: evidence they used/valued it historically. ([LinkedIn][10])
* **Salesforce**: evidence they used/valued it historically. ([LinkedIn][11])
* **ServiceNow**: evidence they hire for ITSM/asset tooling familiarity; whether it’s their standard platform everywhere isn’t publicly confirmable. ([Tesla][13])

---

## What I can’t give you (and why)

Not public / not verifiable:

* “How many orgs” in the internal HR system, and an org chart with reporting lines
* Which specific supplier provides each part number per model per factory
* Shipping contracts, carrier names, volumes, routes, Incoterms, warehouse addresses
* Manufacturing cycle time per model/trim/factory and detailed takt-time breakdown
* Internal ticket taxonomies, ServiceNow instance details, SAP modules, Salesforce object models, etc.

If you see anyone claiming they know those as facts without being inside Tesla or leaking docs, it’s probably guesswork.

---

## If you want, here are 5 deep-dive directions I can do next

No need to answer now — just pick one later and I’ll go all-in:

1. Model Y end-to-end (factory-by-factory differences, likely supplier categories, logistics constraints)
2. Battery supply chain (cells vs. pack vs. raw materials; recycling; compliance)
3. Service & parts business (how service centers + mobile service + OTA change the economics)
4. Energy business (Megapack: manufacturing → project delivery → grid integration)
5. Enterprise systems view (what a plausible SAP/CRM/HRIS/ITSM architecture looks like for Tesla, with only citable evidence + clearly labeled assumptions)

If you tell me which one matters most for your use-case (investment, interview prep, competitor analysis, curiosity), I’ll tailor the next pass.

[1]: https://www.sec.gov/Archives/edgar/data/1318605/000162828025003063/tsla-20241231.htm "tsla-20241231"
[2]: https://www.tesla.com/support/ordering-new-vehicle?utm_source=chatgpt.com "Ordering a Tesla Vehicle | Tesla Support"
[3]: https://www.tesla.com/support/delivery-day?utm_source=chatgpt.com "Tesla Delivery Day | Tesla Support"
[4]: https://www.reuters.com/article/legal/government/piedmont-lithium-amends-supply-deal-with-tesla-shares-rise-idUSL4N33O1ST/?utm_source=chatgpt.com "Piedmont Lithium amends supply deal with Tesla, shares rise"
[5]: https://www.tesla.com/model3/design?utm_source=chatgpt.com "Design Your Model 3"
[6]: https://www.tesla.com/modely/design?utm_source=chatgpt.com "Design Your Model Y"
[7]: https://www.tesla.com/models/design?utm_source=chatgpt.com "Design Your Model S"
[8]: https://www.tesla.com/modelx/design?utm_source=chatgpt.com "Design Your Model X"
[9]: https://www.tesla.com/cybertruck/design?utm_source=chatgpt.com "Design Your Cybertruck"
[10]: https://www.linkedin.com/jobs/view/hr-operations-associate-at-tesla-168059423 "Tesla hiring HR Operations Associate in {:location} | LinkedIn"
[11]: https://www.linkedin.com/jobs/view/salesforce-developer-at-tesla-168062288 "Tesla hiring Salesforce Developer in {:location} | LinkedIn"
[12]: https://www.tesla.com/careers/search/job/parts-advisor-chatswood-246807?utm_source=chatgpt.com "Parts Advisor, Chatswood"
[13]: https://www.tesla.com/careers/search/job/it-asset-management-administrator-237079?utm_source=chatgpt.com "IT Asset Management Administrator"
