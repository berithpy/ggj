# Morse Madness! [![Build Status](https://travis-ci.org/genba-games/morsemadness.svg?branch=master)](https://travis-ci.org/genba-games/morsemadness)
In a world where there are no heroes left...   
A hopeless maze dweller rises up to the challenge and his trusty operator,they'll capture the flag and save the world. Coop game were player 1 takes the role of a maze dweller and player 2 takes the role of his trusty operator.  
The maze dweller's objective is to get to the end of the maze before the lava gets to him. The operator's objective is to solve the doors morse code lock combinations sent to him by the dweller.   

https://berith.itch.io/m-m

Made for the 2018 global gamejam that had "Transmission" as its theme. To check the GameJam version, checkout the `global-gamejam-freeze` branch which will no longer be updated.

### Controls 
P1 WASD QE or first gamepad   
P2 IJKL UO or second gamepad  

### Test it locally
`$ npm install`  
`$ npm run dev`

### TEAM
Alejo Carballude  
Diego Diaz  
Kenia Cantero  
Lara Ibarra  

### COLLABORATORS
Mateo Navarro   
Paul Matousek  

### Deploy it to itch.io
To deploy first build it `npm run deploy`  
Then zip it `zip -r MORSEMADNESSv0.x.x.zip build`  
and finally, ship it ` butler push MORSEMADNESSv0.x.x.zip berith/m-m:HTML5`  
###### the zip stage is optional
