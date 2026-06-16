import json

data = [
    {
        'file': 'repair-detail-steel-renewal.html',
        'title': 'Steel Renewal & Structural',
        'image': '/static/assets/images/repair_steel.jpg',
        'text': 'Systematic renewal and structural repair of corroded or damaged steelwork — hull plating, bulkheads, tank structures, and deck houses — afloat or in drydock. Carried out by class-qualified welders to approved WPS, using materials to IACS, Indian Navy, or client standards, with NDT-certified inspection at every stage. Proficient across FCAW, SMAW, GMAW, and GTAW and across IS 2062, AH36, DMR 249A, and aluminium alloys.',
        'bullets': ['Hull & bulkhead plating repair', 'Drydock & afloat structural renewal', 'Class-qualified WPS welding', 'NDT-certified stage inspections', 'Multi-alloy & high-strength steel proficiency']
    },
    {
        'file': 'repair-detail-hydraulics.html',
        'title': 'Hydraulic Systems & Controls',
        'image': '/static/assets/images/repair_hydraulics.jpg',
        'text': 'Overhaul and testing of steering gear, deck machinery, bow and stern doors, and specialised mechanisms — high-pressure lines, cylinders, valves, pumps, motors, and controls, each pressure-tested and leak-checked. Cylinders are reconditioned or built new to OEM spec; hydrostatic tests run at 1.5x design pressure.',
        'bullets': ['Steering gear & deck machinery overhaul', 'High-pressure line & valve testing', 'Cylinder reconditioning to OEM specs', 'Hydrostatic pressure testing (1.5x)', 'Specialized mechanism repair']
    },
    {
        'file': 'repair-detail-propulsion.html',
        'title': 'Propulsion & Shafting',
        'image': '/static/assets/images/repair_propulsion.jpg',
        'text': 'Shaft-line inspection, laser shaft alignment, bearing replacement, stern/rudder tube weld repair, and vibration correction — across fixed and controllable-pitch propellers, azimuth and tunnel thrusters, waterjets, and fin stabilizers, plus gearboxes, clutches, and FiFi pumps. Propeller NDT, buffing, and preservation restore efficiency.',
        'bullets': ['Laser shaft alignment & inspection', 'Bearing replacement & weld repair', 'Azimuth & tunnel thruster service', 'Vibration correction & NDT', 'Propeller buffing & preservation']
    },
    {
        'file': 'repair-detail-piping.html',
        'title': 'Piping, Valves & Pumps',
        'image': '/static/assets/images/repair_piping.jpg',
        'text': 'Repair and overhaul of onboard piping and auxiliary equipment — air, fuel, bilge, ballast, fire-fighting, seawater, freshwater, sewage, chilled water, and exhaust — across all common metallurgies. Valves reconditioned or replaced and pressure-tested; pumps and compressors rebuilt with new internals under approved Quality Assurance Plans with full traceability.',
        'bullets': ['Comprehensive auxiliary piping overhaul', 'Multi-metallurgy system repairs', 'Valve reconditioning & pressure testing', 'Pump & compressor internal rebuilding', 'QA-approved full traceability']
    },
    {
        'file': 'repair-detail-boilers.html',
        'title': 'Boilers & Steam Turbines',
        'image': '/static/assets/images/repair_boilers.jpg',
        'text': 'Repair of marine boilers, economizers, and steam-turbine-driven equipment — tube cleaning and replacement, refractory work, mounting inspection and resetting, plus dismantling, bearing rebabbitting, impeller balancing, and governor setting and calibration, witnessed per the approved QAP.',
        'bullets': ['Marine boiler & economizer repair', 'Tube cleaning & replacement', 'Refractory work & mounting inspection', 'Impeller balancing & bearing rebabbitting', 'Governor setting & calibration']
    },
    {
        'file': 'repair-detail-hvac.html',
        'title': 'HVAC & Refrigeration',
        'image': '/static/assets/images/repair_hvac.jpg',
        'text': 'Servicing of compressors, chillers, condensers, ducting, FCUs, AHUs, pumps, ventilation fans, and control panels — with refrigerant leak detection, airflow testing, cold-lagging restoration, and cold-room heat-load testing for reliable performance and crew comfort.',
        'bullets': ['Compressor & chiller servicing', 'Ducting & ventilation fan repair', 'Refrigerant leak & airflow testing', 'Cold-lagging & heat-load restoration', 'Control panel diagnostics']
    },
    {
        'file': 'repair-detail-surface-prep.html',
        'title': 'Surface Preparation',
        'image': '/static/assets/images/repair_surface.jpg',
        'text': 'Grit and mechanical cleaning, vacuum grit and shot blasting (including flight decks), UHP hydroblasting up to 40K PSI, and HP hydro-jetting — backed by the largest private UHP fleet in India.',
        'bullets': ['Vacuum grit & shot blasting', 'Flight deck surface preparation', 'UHP hydroblasting (up to 40K PSI)', 'HP hydro-jetting operations', 'Large-scale mechanical cleaning']
    },
    {
        'file': 'repair-detail-painting.html',
        'title': 'Painting & Coating',
        'image': '/static/assets/images/repair_painting.jpg',
        'text': 'Marine-grade finishes applied under NACE-certified inspection: epoxy, coal-tar epoxy for submerged zones, and non-skid deck coatings — all to paint-OEM specification and class requirements.',
        'bullets': ['NACE-certified coating inspection', 'Submerged zone epoxy application', 'Non-skid deck coating', 'OEM specification finishing', 'Marine-grade surface protection']
    }
]

template = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} - Ship Repair | Patel Engineering Works</title>
  <link rel="stylesheet" href="/static/css/styles.css">
  <style>
    /* Structural Layout Only - Inherit Typography from styles.css */
    .page-header {{ padding: 60px 0 40px; border-bottom: 1px solid var(--border-color, #eee); background-color: var(--bg-light, #f8f9fa); }}
    .page-header h1 {{ margin: 0; }}
    .content-section {{ padding: 60px 0; }}
    .content-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: stretch; margin-bottom: 40px; }}
    @media (max-width: 768px) {{ .content-grid {{ grid-template-columns: 1fr; }} }}
    .content-image {{ height: 100%; }}
    .content-image img {{ width: 100%; height: 100%; object-fit: cover; min-height: 250px; border-radius: 4px; box-shadow: var(--shadow-sm, 0 4px 12px rgba(0,0,0,0.05)); }}
    .tech-list {{ list-style: none; padding: 0; margin: 20px 0; }}
    .tech-list li {{ position: relative; padding-left: 20px; margin-bottom: 10px; color: inherit; }}
    .tech-list li::before {{ content: "•"; position: absolute; left: 0; color: var(--accent-red, #C0182E); font-weight: bold; }}
    .cta-section {{ background: var(--bg-light, #f8f9fa); padding: 60px 0; text-align: center; border-top: 1px solid var(--border-color, #eee); }}
    .btn-navy {{ display: inline-block; background-color: var(--primary-navy, #123A7A); color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: 600; border-radius: 4px; transition: background-color 0.3s; margin: 0 10px; }}
    .btn-navy:hover {{ background-color: #0c2652; color: #ffffff; }}
    .btn-red {{ display: inline-block; background-color: var(--accent-red, #C0182E); color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: 600; border-radius: 4px; transition: background-color 0.3s; margin: 0 10px; }}
    .btn-red:hover {{ background-color: #a01325; color: #ffffff; }}
  </style>
</head>
<body>

  {{% include "_navbar.html" %}}

  <div class="page-header">
    <div class="container" style="max-width: 1200px;">
      <h1>{title}</h1>
    </div>
  </div>

  <section class="content-section">
    <div class="container" style="max-width: 1200px;">
      <div class="content-grid">
        <div class="content-text">
          <p style="font-size: 1.05rem; line-height: 1.7; color: var(--text-dark, #333);">{text}</p>
          <ul class="tech-list" style="margin-top: 15px;">
            {bullets_html}
          </ul>
        </div>
        <div class="content-image">
          <img src="{image}" alt="{title}">
        </div>
      </div>
    </div>
  </section>

  <section class="cta-section">
    <div class="container" style="max-width: 1200px;">
      <h3 style="margin-bottom: 30px;">Need support for your next repair project?</h3>
      <a href="{{{{ url_for('contact') }}}}" class="btn-red">Contact Us</a>
      <a href="{{{{ url_for('divisions_repair') }}}}" class="btn-navy">Explore Other Capabilities</a>
    </div>
  </section>

  {{% include "_footer.html" %}}

  <script src="/static/js/main.js"></script>
</body>
</html>'''

for item in data:
    bullets_html = ''.join([f'<li>{b}</li>' for b in item['bullets']])
    html = template.format(
        title=item['title'],
        text=item['text'],
        image=item['image'],
        bullets_html=bullets_html
    )
    with open(f"d:\\pew website\\Patel-Engineering-Works\\templates\\{item['file']}", 'w', encoding='utf-8') as f:
        f.write(html)
