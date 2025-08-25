# Machine Rigidity Factor Engineering Reference

This document provides engineering context and rationale for the rigidity factors assigned to different CNC machines in the JustTheChips calculator.

## Rigidity Factor Scale

The rigidity factor represents the relative structural stiffness of different CNC machines on a scale from 0.0 (very flexible) to 1.0 (industrial rigid). This factor affects cutting parameter calculations by scaling down aggressive settings for less rigid machines.

## Machine Analysis Summary

### Entry-Level Hobby Machines

#### 3018 CNC (Rigidity Factor: 0.15)
- **Construction:** Lightweight aluminum frame, V-wheel linear motion
- **Limitations:** High compliance, limited cutting forces
- **Suitable for:** Light engraving, soft materials only

### Mid-Tier Hobby Machines

#### Lowrider v3 (Rigidity Factor: 0.25)  
- **Construction:** Beam-based design with rolling bearings
- **Benefits:** Scalable size, good for large work pieces
- **Limitations:** Open frame design, bearing compliance

#### **Queenbee Pro (Rigidity Factor: 0.35) - Research Completed**
- **Construction:** 4040 aluminum extrusions, HGR15/20 linear rails, belt drive
- **Benefits:** Linear rails eliminate V-wheel compliance, good precision
- **Limitations:** Aluminum frame, belt drive compliance
- **Analysis:** See detailed analysis in `research/queenbee-pro-rigidity-analysis.md`
- **Research Status:** ✅ Completed - Factor validated as appropriate

### Semi-Professional Machines

#### Benchtop Mill (Rigidity Factor: 0.45)
- **Construction:** Cast iron frame, purpose-built for machining
- **Benefits:** Heavy mass, good vibration damping
- **Limitations:** Limited work envelope, hobby-grade components

#### Rigid Hobby Mill (Rigidity Factor: 0.55)
- **Construction:** Heavy steel/iron frame, precision components
- **Benefits:** Approaching professional capability
- **Limitations:** Still limited by spindle and drives

#### PrintNC (Rigidity Factor: 0.60)
- **Construction:** Welded steel frame, ballscrews, linear rails
- **Benefits:** Professional-grade motion system
- **Limitations:** DIY construction variability

### Professional Machines

#### Entry VMC (Rigidity Factor: 0.8)
- **Construction:** Cast iron base, precision ballscrews, high-power spindle
- **Benefits:** Professional cutting capability
- **Limitations:** Entry-level compared to production machines

### Custom Machine (Rigidity Factor: 0.5)
- **Default:** Mid-range assumption for unknown machines
- **Note:** Should be adjusted based on actual construction

## Rigidity Factor Validation Status

| Machine | Factor | Research Status | Last Updated |
|---------|--------|----------------|--------------|
| 3018 CNC | 0.15 | ⏳ Needs Research | - |
| Lowrider v3 | 0.25 | ⏳ Needs Research | - |
| **Queenbee Pro** | **0.35** | **✅ Completed** | **Dec 2024** |
| PrintNC | 0.60 | ⏳ Needs Research | - |
| Benchtop Mill | 0.45 | ⏳ Needs Research | - |
| Rigid Hobby Mill | 0.55 | ⏳ Needs Research | - |
| Entry VMC | 0.8 | ⏳ Needs Research | - |
| Custom | 0.5 | N/A | - |

## Engineering Considerations

### Factors Affecting Rigidity
1. **Frame Material:** Steel > Cast Iron > Aluminum > Composite
2. **Frame Construction:** Welded > Bolted > Clamped
3. **Linear Motion:** Ballscrew + Rails > Leadscrew + Rails > Belt + Rails > V-wheels
4. **Machine Mass:** Higher mass generally improves vibration damping
5. **Spindle Integration:** Integral > Clamped > Mounted

### Calculation Impact
The rigidity factor is used to:
- Scale cutting forces to prevent machine overload
- Adjust feed rates for machine capability  
- Modify depth of cut recommendations
- Generate appropriate warnings for machine limitations

### Future Research Priorities
Based on the research tasks file, the following machines need detailed analysis:
1. 3018 CNC (High Priority)
2. Lowrider v3 (High Priority) 
3. PrintNC (High Priority)
4. Benchtop Mill (Medium Priority)
5. Entry VMC (Medium Priority)

---

*This document is updated as machine research is completed. Each completed analysis should update this summary and mark the research as complete.*