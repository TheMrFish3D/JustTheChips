# Research Tasks for JustTheChips CNC Calculator

This file tracks research tasks needed for the visual overhaul and enhanced functionality. When an issue is created and completed for a research task, it should be removed from this list by the copilot agent addressing that issue.

## Machine Rigidity Research Tasks

### 1. 3018 CNC Machine Rigidity Analysis
**Priority:** High
**Estimated Effort:** 2-3 hours
**Description:** Research and model the structural rigidity of 3018 CNC machines
- Research frame construction (aluminum extrusion vs steel)
- Analyze spindle mount rigidity
- Study axis backlash and compliance characteristics
- Find existing rigidity measurements or studies
- Develop rigidity factor calculations for different 3018 variants

### 2. Lowrider v3 CNC Rigidity Analysis  
**Priority:** High
**Estimated Effort:** 2-3 hours
**Description:** Research and model the structural rigidity of Lowrider v3 CNC machines
- Analyze torsion box table construction impact on rigidity
- Study rolling/sliding bearing system effects
- Research spindle mount options and their rigidity
- Find community measurements and testing data
- Develop rigidity factors for different table sizes

### 3. Queenbee Pro CNC Rigidity Analysis
**Priority:** Medium
**Estimated Effort:** 2 hours  
**Description:** Research and model the structural rigidity of Queenbee Pro machines
- Study aluminum frame construction details
- Analyze linear rail system rigidity
- Research spindle mounting rigidity
- Compare with other hobby machines in similar class

### 4. PrintNC CNC Rigidity Analysis
**Priority:** High
**Estimated Effort:** 3-4 hours
**Description:** Research and model the structural rigidity of PrintNC machines
- Analyze steel welded frame construction
- Study linear rail and ballscrew system
- Research different PrintNC size variants
- Find community rigidity testing data
- Develop size-dependent rigidity factors

### 5. Entry VMC and Benchtop Mill Rigidity Research
**Priority:** Medium
**Estimated Effort:** 2-3 hours
**Description:** Research rigidity characteristics of entry-level VMCs and benchtop mills
- Study typical construction methods
- Analyze weight and material effects on rigidity
- Research spindle integration rigidity
- Compare with hobby CNC machines

### 6. Custom Machine Rigidity Estimation Framework
**Priority:** High
**Estimated Effort:** 4-5 hours
**Description:** Develop framework for estimating custom machine rigidity
- Create mathematical model based on construction type
- Develop input parameters for rigidity estimation
- Research correlation between machine weight, frame type, and rigidity
- Create validation method against known machines

## Educational Content Research Tasks



### 8. Hobby Machine Limitations Research
**Priority:** Medium  
**Estimated Effort:** 2-3 hours
**Description:** Research specific limitations and considerations for hobby machines
- Study power limitations and their effects
- Research rigidity limitations on achievable surface finish
- Analyze tooling limitations for hobby machines
- Document best practices for hobby machine operation

## Cutting Parameter Research Tasks

### 9. Hobby Machine Optimal Parameters Research
**Priority:** Medium
**Estimated Effort:** 3-4 hours
**Description:** Research optimal cutting parameters for hobby machines
- Study reduced aggressiveness factors for hobby machines
- Research material-specific considerations for low-rigidity machines
- Analyze tool deflection limits for hobby applications
- Document parameter ranges for different machine classes

### 10. Power Curve Validation Research
**Priority:** Low
**Estimated Effort:** 2-3 hours
**Description:** Validate and improve spindle power curve calculations
- Research actual Dewalt router power curves
- Validate VFD spindle power characteristics
- Improve power calculation accuracy
- Add temperature derating factors

## Total Estimated Research Effort: 29-37 hours

These research tasks can be executed in parallel by different agents/issues to accelerate development. Each task should result in:
1. Updated data files (machines.json, spindles.json)
2. Enhanced calculation algorithms
3. Educational content additions
4. Documentation updates

**Note:** This file should be updated by copilot agents as they complete research tasks or identify new research needs.