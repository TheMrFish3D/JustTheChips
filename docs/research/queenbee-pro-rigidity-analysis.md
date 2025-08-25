# Queenbee Pro CNC Rigidity Analysis

**Research Date:** December 2024  
**Priority:** Medium  
**Estimated Effort:** 2 hours  
**Status:** Completed

## Executive Summary

This document analyzes the structural rigidity characteristics of Queenbee Pro CNC machines to validate and refine the rigidity modeling parameters used in the JustTheChips calculator.

## Machine Overview

The Queenbee Pro is a popular hobby-class CNC router/mill designed for precision work in wood, plastics, and soft metals. It represents a mid-tier hobby machine with better rigidity than entry-level machines like the 3018 but lower than purpose-built mills.

## Structural Analysis

### Frame Construction

**Design:** Aluminum extrusion framework
- **Primary Structure:** Typically 4040 aluminum extrusions for main frame members
- **Joint Method:** Corner brackets and T-nuts for assembly
- **Material:** 6061-T6 aluminum alloy
- **Weight:** Approximately 40-50 kg depending on size variant

**Rigidity Characteristics:**
- Aluminum extrusion provides good strength-to-weight ratio
- Bolted joints introduce compliance compared to welded construction
- Rectangular frame geometry provides good torsional resistance
- Limited by connection point compliance under cutting forces

### Linear Motion System

**Guide Rails:** 
- **Type:** HGR15 or HGR20 linear rails (15-20mm rail width)
- **Material:** Steel rails with steel ball carriages
- **Preload:** Adjustable preload for backlash elimination
- **Mounting:** Direct bolt-on to aluminum extrusions

**Rigidity Impact:**
- Linear rails provide excellent precision and repeatability
- Much more rigid than V-wheel systems used in cheaper machines
- Proper preload eliminates backlash and improves cutting accuracy
- Steel-on-steel contact provides high load capacity

### Drive System

**X/Y Axes:**
- **Type:** Typically belt drive (GT2 timing belt)
- **Motor Mounting:** NEMA 23 stepper motors
- **Reduction:** Direct drive or minimal reduction

**Z-Axis:**
- **Type:** Ballscrew or precision leadscrew
- **Pitch:** Typically 4-5mm pitch for good resolution
- **Support:** Dual bearing support on both ends

**Rigidity Considerations:**
- Belt drive systems have inherent compliance under load
- Ballscrew Z-axis provides good rigidity in cutting direction
- Motor mounting to aluminum frame may allow vibration

### Spindle Mounting System

**Spindle Integration:**
- **Mount Type:** Aluminum Z-carriage with clamping collar
- **Spindle Options:** 
  - Dewalt DW660/DW611 router (common upgrade)
  - ER11 or ER16 spindle systems
  - 400W-800W air-cooled spindles typical

**Mounting Rigidity:**
- Aluminum mounting system provides decent rigidity
- Clamp-style mounts can allow slight spindle movement under load
- Overhang from Z-carriage creates cantilever loading

## Comparative Analysis

### Rigidity Ranking (0.0 = flexible, 1.0 = industrial rigid)

| Machine Type | Current Factor | Analysis |
|--------------|---------------|----------|
| 3018 CNC | 0.15 | V-wheels, lightweight frame, high compliance |
| Lowrider v3 | 0.25 | Beam-based, rolling system, moderate rigidity |
| **Queenbee Pro** | **0.35** | **Aluminum frame, linear rails, good mid-tier** |
| Benchtop Mill | 0.45 | Cast iron, more mass, purpose-built for machining |
| PrintNC | 0.60 | Steel welded frame, ballscrews, high rigidity |

### Justification for 0.35 Rigidity Factor

**Positive Factors (+):**
- Linear rail system eliminates many compliance issues of V-wheel machines
- 4040 aluminum extrusions provide good structural backbone
- Ballscrew Z-axis gives good cutting direction rigidity
- Overall design optimized for light machining operations

**Limiting Factors (-):**
- Aluminum frame lighter than cast iron alternatives
- Bolted connections introduce compliance points
- Belt drive X/Y axes have inherent stretch/compliance
- Spindle overhang creates tool deflection amplification
- Limited thermal mass for heat dissipation during cutting

**Comparison Rationale:**
- **vs 3018 (0.15):** Significantly more rigid due to linear rails and larger frame
- **vs Lowrider v3 (0.25):** More rigid due to enclosed frame vs beam construction
- **vs Benchtop Mill (0.45):** Less rigid due to aluminum vs cast iron construction
- **vs PrintNC (0.60):** Much less rigid due to bolted vs welded steel frame

## Engineering Recommendations

### Current Assessment
The existing rigidity factor of **0.35** appears well-calibrated based on construction analysis. This places the Queenbee Pro appropriately in the hobby machine hierarchy.

### Potential Refinements
Consider minor adjustment to **0.32-0.38** range based on:
- Specific frame size (larger = more flexible)
- Spindle mounting quality (affects effective rigidity)
- Assembly quality (proper bolt torque, rail preload)

### Machine-Specific Considerations
For calculation accuracy, the Queenbee Pro rigidity should account for:
1. **Size scaling:** Larger work areas reduce rigidity
2. **Spindle type:** Router vs proper spindle affects mounting rigidity
3. **Cutting location:** Center of table vs edges affects deflection

## Implementation in JustTheChips

### Current Parameters
```json
{
  "id": "queenbee_pro",
  "axis_max_feed_mm_min": 4000,
  "rigidity_factor": 0.35,
  "aggressiveness": {
    "axial": 0.5,
    "radial": 0.6, 
    "feed": 0.7
  }
}
```

### Recommended Updates
Based on research, the current parameters appear well-calibrated. No changes recommended at this time.

### Future Enhancements
Consider adding extended parameters for more detailed modeling:
- Frame size factor
- Spindle mounting type
- Linear rail specifications
- Drive system compliance factors

## Conclusions

1. **Rigidity Factor Validation:** The current 0.35 factor is appropriate for Queenbee Pro machines
2. **Market Position:** Correctly positioned between budget (3018) and semi-professional (PrintNC) machines  
3. **Construction Analysis:** Aluminum frame + linear rails provides good rigidity for hobby applications
4. **Limitations:** Belt drive and aluminum construction limit capability vs industrial machines

The Queenbee Pro represents a well-balanced design for hobby CNC applications, offering significantly improved rigidity over entry-level machines while remaining accessible for hobbyist budgets and shop spaces.

## Research Sources

- Queenbee Pro technical specifications and build documentation
- Linear rail manufacturer specifications (HIWIN HGR series)
- Aluminum extrusion structural properties (6061-T6)
- Community feedback and measured cutting performance data
- Comparative analysis with similar hobby CNC machines

---

**Research Completed:** December 2024  
**Next Review:** As needed for calculation validation