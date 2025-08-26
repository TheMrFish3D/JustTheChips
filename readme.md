Spindle Calculator. 
This is a simple web based feeds and speeds, and cutting power model. 
Initial scope reasonably small. Single web page. Keep tests and other artefacts to a minimum for now. Basic github actions to deploy to pages.  

1) machine config card
    1) spindle - assume all VFD spindles for now - other spindles will be added later so leave room in the code for other types
        1) power
        2) spindle frequency hz
        3) max rpm
    2) motors
        1) X axis motor torque
        2) # of x axis motors
        3) y axis motor torque
        4) # of y axis motors
        5) z axis motor torque
        4) # of z axis motors
    3) coolant - vacuum, mist, flood, airblast
    4) Metric or imperial, default to metric
2) Tool config card
    1) type, flat endmill, ball endmill, insert endmill(e.g. bap300), drill, threadmill, vbit or chamfer bit etc etc etc
    2) tool diameter
    3) number of flutes
    4) stickout
    5) tool material
    6) tool coating
3) Material 
    1) check boxes for materials to generate settings for, list common materials including hardwood, softwood, acrylic, aluminium - most common varieties, mild steel, stainless steel etc.
4) Operation/cut type/process
    1) check boxes for the operations you want to generate optimal cutting parameters for slotting, facing, contour, adaptive, pocketing, drilling, threading   
    2) target finish - roughing, finishing
5) locked parameters - explanation - by default the calculator will calculate all parameters, however here you can fix parameters on demand - surface speed, feed per tooth, rpm, depth of cut, width fo cut(for operations where it matters only, use the proper term for this), feed rate etc etc - note that it should not allow you to set impossible parameters and show an error - like where feed per tooth is set, rpm is set and feed rate is set, surface speed - this could be set to values that are impossible. highlight this and stop calulation
6) Either realtime updates for calculations but if not a button/card to click calculate
6) calculated parameters table 
This should show all calculated ideal parameters for the various cut types and materials selected. This should include RPM, feed rate, feed per tooth, depth of cut, stepover, material removal rate, spindle power abd torque as absolute and percentage of available, xyz stepper power and torque requirements, cutting force information, material removal rate.
Any parameters that are out of optimal range should be highlighted somehow 

7) detailed analysis - when you click on one of the lines in the calculated parameters table it should show a new card with detailed analysis - include graphs that show for each parameter where it sits compared to the optimal parameters for your cut or spindle or material

8) export as csv/json

In fullscreen mode the machine config, tool config, operations and locked parameters should be on the left, table in the middle and analysis on the right.

App is called "Just the Chip"

All calculations must work. 
All backgrounds dark(including drop downs etc) - dark grey, fonts light - keep everything visible. font styreneb. Minimal visual flare - keep it simple. Same background colour for cards and main background, with a lighter grey border on the cards. 

Any unfinished work must be documented in a to-do