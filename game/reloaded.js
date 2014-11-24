// RomboFight Reloaded
// (cc) Licensed under Creative Commons CC-BY-NC by Three Universe Studios 2014

//Constructor
RomboFight=function(input)
{
  //Init game engine
  RomboEngine.call(this, input)
  
  //Init background
  this.setupBackground(RomboBackground);
  this.canvas.style.backgroundColor="#000000"
  
  //Create something like a menu system
  this.menuSystem={
    "mainMenu":{
      "name":"main",
      "elements":[
        {
          "type":"image",
          "selectable":false,
          "image":this.loadImage("reloaded.png"),
          "label":"",
          "pos":{"x":0,"y":-248}
        },
        {
          "type":"button",
          "selectable":true,
          "label":"Local game",
          "width":240,
          "pos":{"x":0,"y":0},
          "action":"choose",
          "onChoose":function(element,player)
          {
          },
          "name":"locgame"
        },
        {
          "type":"button",
          "selectable":true,
          "label":"Multiplayer",
          "width":240,
          "pos":{"x":0,"y":48},
          "action":"choose",
          "onChoose":function(element,player)
          {
          },
          "name":"multi"
        },
        {
          "type":"button",
          "selectable":true,
          "label":"Settings",
          "width":240,
          "pos":{"x":0,"y":96},
          "action":"press",
          "onPress":function(element,player)
          {
            this.notify("Work in progress. Sorry.");
          }
        },
        {
          "type":"button",
          "selectable":true,
          "label":"Controls",
          "width":240,
          "pos":{"x":0,"y":144},
          "action":"press",
          "onPress":function(element,player)
          {
            this.notify("Work in progress. Sorry.",player);
          }
        },
        {
          "type":"button",
          "selectable":true,
          "label":"Remap device",
          "width":240,
          "pos":{"x":0,"y":192},
          "action":"press",
          "inputTypes":["gamepad"],
          "buttonToPress":"any",
          "onPress":function(element,player)
          {
            this.createMenu(this.menus.layoutMenu);
          }
        },
        {
          "type":"button",
          "selectable":true,
          "label":"Drop out",
          "width":240,
          "pos":{"x":0,"y":240},
          "action":"press",
          "onPress":function(element,player)
          {
            this.dropOut(player);
          }
        }
      ],
      "onChoose":function(choices)
      {
        var agreement=true;
        for(var i=0;i<choices.length-1;i++)
        {
          if(choices[i]!=choices[i+1])
          {
            agreement=false;
          }
        }
        if(agreement)
        {
          if(choices[0] && choices[0].name=="locgame")
          {
            this.startGame();
          }
        }
      }
    }
  };
  
  //Load the images
  this.images={
    "base":this.loadImage("game/images/base.png"),
    "heat":this.loadImage("game/images/heat.png"),
    "shield":this.loadImage("game/images/shield.png"),
    "bumper":this.loadImage("game/images/bumper.png"),
    "deadbody":this.loadImage("game/images/deadbody.png")
  }
  this.playerImages={
    "base":[
      this.loadImage("game/images/base_g.png"),
      this.loadImage("game/images/base_y.png"),
      this.loadImage("game/images/base_w.png"),
      this.loadImage("game/images/base_b.png"),
      this.loadImage("game/images/base_e.png"),
      this.loadImage("game/images/base_r.png")
    ],
    "fighter":[
      this.loadImage("game/images/fighter_g.png"),
      this.loadImage("game/images/fighter_y.png"),
      this.loadImage("game/images/fighter_w.png"),
      this.loadImage("game/images/fighter_b.png"),
      this.loadImage("game/images/fighter_e.png"),
      this.loadImage("game/images/fighter_r.png")
    ]
  }
  
  //And some space for the players
  this.fighters=[];
  this.controls=[];
  this.missiles=[]; //Pretty nice pattern here... too nice it caused OCD
  this.corpses=[];
  this.fighterId=0;
  
  //This is for the AI
  this.aiTicks=[];
  this.aiId=0;
  
  //Some settings here
  this.weaponSlots=[
    {"x":50,"y":0},
    {"x":-50,"y":0},
    {"x":0,"y":110},
    {"x":0,"y":0}
  ];
  var ordinaryBarrel=[
    this.loadImage("game/images/barrel_g.png"),
    this.loadImage("game/images/barrel_y.png"),
    this.loadImage("game/images/barrel_w.png"),
    this.loadImage("game/images/barrel_b.png"),
    this.loadImage("game/images/barrel_e.png"),
    this.loadImage("game/images/barrel_r.png")
  ];
  this.weapons={
    //Primary or secondary
    "simplegun":
    {
      "freedomPerMinute":1500,
      "barrels":[
        {
          "x":0,
          "y":7.5,
          "recoilPerShot":0.25,
          "maxRecoil":20,
          "recoilDampener":0.05,
          "shotPower":50,
          "shotDamage":0.4,
          "trailVanish":0.2 
        }
      ],
      "effects":[],
      "heat":0.1,
      "images":[
        this.loadImage("game/images/simplegun_g.png"),
        this.loadImage("game/images/simplegun_y.png"),
        this.loadImage("game/images/simplegun_w.png"),
        this.loadImage("game/images/simplegun_b.png"),
        this.loadImage("game/images/simplegun_e.png"),
        this.loadImage("game/images/simplegun_r.png")
      ],
      "barrelImages":ordinaryBarrel
    },
    "doublegun":
    {
      "freedomPerMinute":3000,
      "barrels":[
        {
          "x":-10,
          "y":7.5,
          "recoilPerShot":0.25,
          "maxRecoil":20,
          "recoilDampener":0.05,
          "shotPower":50,
          "shotDamage":0.2,
          "trailVanish":0.2
        },
        {
          "x":10,
          "y":7.5,
          "recoilPerShot":0.25,
          "maxRecoil":20,
          "recoilDampener":0.05,
          "shotPower":50,
          "shotDamage":0.2,
          "trailVanish":0.2
        }
      ],
      "effects":[],
      "heat":0.05,
      "images":[
        this.loadImage("game/images/doublegun_g.png"),
        this.loadImage("game/images/doublegun_y.png"),
        this.loadImage("game/images/doublegun_w.png"),
        this.loadImage("game/images/doublegun_b.png"),
        this.loadImage("game/images/doublegun_e.png"),
        this.loadImage("game/images/doublegun_r.png")
      ],
      "barrelImages":ordinaryBarrel
    },
    //Support weapons
    "shield":
    {
      "freedomPerMinute":3000,
      "barrels":[],
      "effects":[
        {
          "type":"shield",
          "strength":0.05,
          "fallback":0.025
        }
      ],
      "heat":0.025,
      "images":[
        this.loadImage("game/images/shieldgen_g.png"),
        this.loadImage("game/images/shieldgen_y.png"),
        this.loadImage("game/images/shieldgen_w.png"),
        this.loadImage("game/images/shieldgen_b.png"),
        this.loadImage("game/images/shieldgen_e.png"),
        this.loadImage("game/images/shieldgen_r.png")
      ]
    },
    "bumper":
    {
      "barrels":[],
      "effects":[
        {
          "type":"bumper",
          "strength":0.1,
          "fallback":0.05
        }
      ],
      "heat":0.05,
      "images":[
        this.loadImage("game/images/bumpergen_g.png"),
        this.loadImage("game/images/bumpergen_y.png"),
        this.loadImage("game/images/bumpergen_w.png"),
        this.loadImage("game/images/bumpergen_b.png"),
        this.loadImage("game/images/bumpergen_e.png"),
        this.loadImage("game/images/bumpergen_r.png")
      ]
    },
    "mine":
    {
      "barrels":[],
      "effects":[],
      "heat":0.05,
      "images":[
        this.loadImage("game/images/minegen_g.png"),
        this.loadImage("game/images/minegen_y.png"),
        this.loadImage("game/images/minegen_w.png"),
        this.loadImage("game/images/minegen_b.png"),
        this.loadImage("game/images/minegen_e.png"),
        this.loadImage("game/images/minegen_r.png")
      ]
    },
    "shieldtrail":
    {
      "barrels":[],
      "effects":[],
      "heat":0.05,
      "images":[
        this.loadImage("game/images/shieldtrail_g.png"),
        this.loadImage("game/images/shieldtrail_y.png"),
        this.loadImage("game/images/shieldtrail_w.png"),
        this.loadImage("game/images/shieldtrail_b.png"),
        this.loadImage("game/images/shieldtrail_e.png"),
        this.loadImage("game/images/shieldtrail_r.png")
      ]
    },
    "flametrail":
    {
      "barrels":[],
      "effects":[],
      "heat":0.05,
      "images":[
        this.loadImage("game/images/flametrail_g.png"),
        this.loadImage("game/images/flametrail_y.png"),
        this.loadImage("game/images/flametrail_w.png"),
        this.loadImage("game/images/flametrail_b.png"),
        this.loadImage("game/images/flametrail_e.png"),
        this.loadImage("game/images/flametrail_r.png")
      ]
    },
    "speedtrail":
    {
      "barrels":[],
      "effects":[],
      "heat":0.05,
      "images":[
        this.loadImage("game/images/speedtrail_g.png"),
        this.loadImage("game/images/speedtrail_y.png"),
        this.loadImage("game/images/speedtrail_w.png"),
        this.loadImage("game/images/speedtrail_b.png"),
        this.loadImage("game/images/speedtrail_e.png"),
        this.loadImage("game/images/speedtrail_r.png")
      ]
    }
  };
  
  //Some additional options
  this.options.missileDetail=3;
  this.options.minHeat=0.25;
  this.options.maxHeat=5;
  this.options.fighterCooldown=0.01;
  this.options.friendlyFire=false;
  this.options.regenerationFactor=0.005;
  this.options.corpseDespawnRate=0.01;
  this.options.players=[];
  for(var i=0;i<=this.colors.length;i++)
  {
    this.options.players.push({
      "primary":"doublegun",
      "secondary":"simplegun",
      "support":"shield",
      "ultra":false
    });
  }
  this.options.giveAiOnReplace=false;
  this.options.power=20;
  this.options.drag=0.0064;
  this.options.friction=5;
  this.options.collisionDamage=0.2;
  this.options.rebounceRatio=0;
  this.options.hudSize=72;
  this.options.hudGap=1.5;
  this.options.hudWidth=2;
  this.options.hudSpeed=0.01;
  this.options.hudOffset=5;
  this.options.hudAngle=0.4;
  this.options.hudOpacity=0.75;
  this.options.enemyPerPlayer=1;
  this.options.matchDelay=60;
  this.options.respawnWinner=true;
  this.options.aiDelay=5;
  this.options.aiDelayRatio=1;
  this.options.aiScript="game/ai/original.js";
  
  //And statistics
  this.stats.players=[];
  for(var i=0;i<=this.colors.length;i++)
  {
    this.stats.players.push({
      "hits":0,
      "kills":0,
      "assist":0,
      "teamkills":0
    });
  }
  this.stats.ingame=false;
  this.stats.matchless=0;
  
  this.tickId=0;
}
//Inheritance
RomboFight.prototype=RomboEngine.prototype;

//Hook the main menu from the engine
RomboFight.prototype.gameMenu=function()
{
  this.createMenu(this.menuSystem.mainMenu);
}

//It is inevitable.
RomboFight.prototype.startGame=function()
{
  this.applyMenu(null,"ingame");
  this.mode="game";
  
  this.stats.wins=0;
  this.stats.loses=0;
  
  var time=new Date().getTime();
  this.sithAi=new Worker(this.options.aiScript+"?"+time);
  this.jediAi=new Worker(this.options.aiScript+"?"+time);
  
  var self=this;
  this.sithAi.onmessage=function(event)
  {
    self.reactToAi.call(self,event,false);
  }
  this.jediAi.onmessage=function(event)
  {
    self.reactToAi.call(self,event,true);
  }
  
  var weapons=[];
  for(var i in this.weapons)
  {
    weapons[i]={
      "barrels":this.cloneObject(this.weapons[i].barrels),
      "effects":this.cloneObject(this.weapons[i].effects),
      "heat":this.weapons[i].heat,
      "freedomPerMinute":this.weapons[i].freedomPerMinute
    };
  }
  var initMessage={
    "type":"init",
    "options":this.options,
    "weapons":weapons,
    "weaponSlots":this.weaponSlots
  };
  
  this.sithAi.postMessage(initMessage);
  this.jediAi.postMessage(initMessage);
  
  this.spawnSides(true,true);
}

//It is.
RomboFight.prototype.endGame=function()
{
  this.sithAi.terminate();
  this.jediAi.terminate(); //Execute Order 66
  
  //this.checkMate(); //Only in multiplayer or fixed round match
  
  this.fighters=[];
  this.missiles=[];
  this.controls=[];
  this.corpses=[];
  this.aiTicks=[];
  
  this.stats.players=[];
  for(var i=0;i<=this.colors.length;i++)
  {
    this.stats.players.push({
      "hits":0,
      "kills":0,
      "assist":0,
      "teamkills":0
    });
  }
  
  this.createMenu(this.menuSystem.mainMenu);
}

//The most underrated code ever.
//It does everything, but no one cares until it becomes slow.
RomboFight.prototype.gameTick=function()
{
  if(Array("game").indexOf(this.mode)>-1) //The second laziest structure I've ever designed. I'm so proud of myself.
  {
    this.rollAi(); //They see me rollin'...
    
    for(var i=0;i<this.controls.length;i++)
    {
      this.useControl(this.controls[i]);
    }
    this.removableCorpses=[];
    for(var i=0;i<this.corpses.length;i++)
    {
      this.moveCorpse(this.corpses[i]);
    }
    this.buryCorpses();
    this.deadFighters=[];
    for(var i=0;i<this.fighters.length;i++)
    {
      this.moveFighter(this.fighters[i]);
      for(j=0;j<this.fighters[i].weapons.length;j++)
      {
        this.coolWeapon(this.fighters[i].weapons[j]);
      }
      this.removeEffects(this.fighters[i]);
      this.testFighter(this.fighters[i]);
    }
    this.sendToAsgard();
    for(var i=0;i<this.missiles.length;i++)
    {
      this.moveMissile(this.missiles[i]);
      this.testMissile(this.missiles[i]);
    }
    this.cleanupMissiles();
    
    this.checkMatch();
    
    if(!this.stats.ingame)
    {
      this.notifholder.style.left="auto";
      this.notifholder.style.right="40px";
    }
    this.stats.ingame=true;
  }
  else
  {
    if(this.stats.ingame)
    {
      this.notifholder.style.left="40px";
      this.notifholder.style.right="auto";
    }
    this.stats.ingame=false;
  }
  this.tickId++;
}

//Sorry, I wasn't right. If anything becomes slow, they blame THIS code.
RomboFight.prototype.gameDraw=function()
{
  this.stats.currentDraw.linesDrawn=0;
  if(this.drawWarning)
  {
    this.context.fillStyle="#ff0000";
    this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
    this.drawWarning=false;
  }
  if(Array("game").indexOf(this.mode)>-1) //See?
  {
    for(var i=0;i<this.corpses.length;i++)
    {
      this.drawCorpse(this.corpses[i]);
    }
    for(var i=0;i<this.fighters.length;i++)
    {
      this.drawFighter(this.fighters[i]);
    }
    for(var i=0;i<this.missiles.length;i++)
    {
      this.drawMissile(this.missiles[i]);
    }
    for(var i in this.inputs)
    {
      var player=this.getPlayerId(this.inputs[i].color);
      this.drawHud(player,i);
    }
    
    this.notifholder.left="";
  }
  //console.log(this.stats.currentDraw.linesDrawn);
  
}

//But OK, let's do something less underrated
RomboFight.prototype.spawnFighter=function(fighterdata)
{
  var isOkay=false;
  var size={"x":50,"y":80};
  var pos;
  while(!isOkay)
  {
    pos={"x":Math.random()*(this.canvas.width-size.x)+size.y/2,"y":Math.random()*(this.canvas.height-size.y)+size.y/2};
    isOkay=true;
    for(var i in this.fighters)
    {
      if(this.testCollision({"pos":pos,"size":size},this.fighters[i]))
      {
        isOkay=false;
      }
    }
  }
  var fighter={
    "pos":pos,
    "speed":{"x":0,"y":0},
    "size":size,
    "sizeRatio":0.2,
    "health":1,
    "heat":this.options.maxHeat,
    "effects":[{
      "type":"shield",
      "strength":this.options.maxHeat-this.options.minHeat,
      "fallback":this.options.fighterCooldown
    }],
    "player":fighterdata.player,
    "weapons":[],
    "weaponsToFire":[],
    "jedi":(fighterdata.jedi!==undefined) ? fighterdata.jedi : true, //This specifies the side it'll fight on if you don't understand for some reason
    "overheat":true,
    "inCollision":false,
    "lastHit":false,
    "id":this.fighterId++
  };
  this.fighters.push(fighter);
  return fighter;
}

//You can even see this in action
RomboFight.prototype.moveFighter=function(fighter)
{
  var realSpeed=Math.sqrt(Math.pow(fighter.speed.x,2)+Math.pow(fighter.speed.y,2));
  var drag=Math.pow(realSpeed,2)*this.options.drag;
  if(realSpeed)
  {
    fighter.speed.x-=fighter.speed.x*drag/realSpeed;
    fighter.speed.y-=fighter.speed.y*drag/realSpeed;
  }
  
  var realSpeed=Math.sqrt(Math.pow(fighter.speed.x,2)+Math.pow(fighter.speed.y,2));
  var friction=Math.min(realSpeed,this.options.friction);
  if(realSpeed)
  {
    fighter.speed.x-=fighter.speed.x*friction/realSpeed;
    fighter.speed.y-=fighter.speed.y*friction/realSpeed;
  }
  
  
  fighter.pos.x+=fighter.speed.x;
  fighter.pos.y+=fighter.speed.y;
  
  if(fighter.pos.x<fighter.size.x/2)
  {
    fighter.pos.x=fighter.size.x/2;
    fighter.speed.x=-fighter.speed.x/2;
  }
  if(fighter.pos.x>this.canvas.width-fighter.size.x/2)
  {
    fighter.pos.x=this.canvas.width-fighter.size.x/2;
    fighter.speed.x=-fighter.speed.x/2;
  }
  if(fighter.pos.y<fighter.size.y/2)
  {
    fighter.pos.y=fighter.size.y/2;
    fighter.speed.y=-fighter.speed.y/2;
  }
  if(fighter.pos.y>this.canvas.height-fighter.size.y/2)
  {
    fighter.pos.y=this.canvas.height-fighter.size.y/2;
    fighter.speed.y=-fighter.speed.y/2;
  }
  
  if(fighter.heat>0)
  {
    fighter.heat-=this.options.fighterCooldown;
  }
  if(fighter.heat<=this.options.minHeat)
  {
    fighter.overheat=false;
  }
  
  if(!fighter.overheat)
  {
    for(var key in fighter.weaponsToFire)
    {
      var weaponProto=this.weapons[fighter.weaponsToFire[key].type];
      if(fighter.heat<=this.options.maxHeat)
      {
        this.shootWeapon(fighter,fighter.weaponsToFire[key]);
        if(fighter.heat>this.options.maxHeat)
        {
          fighter.overheat=true;
        }
      }
    }
  }
  
  if(fighter.health<=0)
  {
    this.deadFighters.push(this.fighters.indexOf(fighter));
    this.getControlOfPlayer(fighter.player).fighter=false;
    if(fighter.lastHit)
    {
      this.stats.players[fighter.lastHit.player].kills++;
    }
  }
  if(fighter.health<1)
  {
    fighter.health=Math.min(fighter.health+this.options.regenerationFactor,1);
  }
}

//False. You will need this to see the previous function.
RomboFight.prototype.drawFighter=function(fighter)
{
  this.drawImageTo(this.images.base,fighter.pos,fighter.sizeRatio);
  this.drawImageTo(this.playerImages.base[fighter.player],fighter.pos,fighter.sizeRatio,fighter.health);
  this.drawImageTo(this.playerImages.fighter[fighter.player],fighter.pos,fighter.sizeRatio);
  this.drawImageTo(this.images.heat,fighter.pos,fighter.sizeRatio,fighter.heat);
  for(var i=0;i<fighter.weapons.length;i++)
  {
    this.drawWeapon(fighter,fighter.weapons[i]);
  }
  this.drawEffects(fighter);
}

//But they will respect this function immediately when we turn it off
RomboFight.prototype.useControl=function(control)
{
  if(!control.fighter)
  {
    return false;
  }
  
  if(control.input.type=="gamepad")
  {
    if(!this.getGamepadByIndex(control.input.index)
    || control.input.pressed.indexOf(9)>-1
    || control.input.pressed.indexOf(10)>-1)
    {
      if(this.getGamepadByIndex(control.input.index))
      {
        this.dropOut(this.getPlayerId(control.input.color));
      }
      if(!this.giveAiOnReplace)
      {
        control.input.type="disabled";
        control.fighter.health=0;
      }
      else
      {
        control.input={};
        control.input={
          "type":"ai",
          "id":this.aiId++
        };
      }
    }
    else
    {
      control.dir.x=this.getGamepadByIndex(control.input.index).axes[0];
      control.dir.y=this.getGamepadByIndex(control.input.index).axes[1];
      if(control.input.pressed.indexOf(12)>-1 && control.input.pressed.indexOf(13)==-1)
      {
        control.dir.y=-1;
      }
      if(control.input.pressed.indexOf(13)>-1 && control.input.pressed.indexOf(12)==-1)
      {
        control.dir.y=+1;
      }
      if(control.input.pressed.indexOf(14)>-1 && control.input.pressed.indexOf(15)==-1)
      {
        control.dir.x=-1;
      }
      if(control.input.pressed.indexOf(15)>-1 && control.input.pressed.indexOf(14)==-1)
      {
        control.dir.x=+1;
      }
      control.primary=control.input.pressed.indexOf(control.input.remap[0])>-1;
      control.secondary=control.input.pressed.indexOf(control.input.remap[1])>-1;
      control.support=control.input.pressed.indexOf(control.input.remap[2])>-1;
      control.ultra=control.input.pressed.indexOf(control.input.remap[3])>-1;
    }
  }
  else if(control.input.type=="keyboard")
  {
    if(control.input.pressed.indexOf(27)>-1)
    {
      this.dropOut(this.getPlayerId(control.input.color));
      if(!this.giveAiOnReplace)
      {
        control.input.type="disabled";
        control.fighter.health=0;
      }
      else
      {
        control.input={};
        control.input={
          "type":"ai",
          "id":this.aiId++
        };
      }
    }
    var x=0;
    var y=0;
    x-=(control.input.pressed.indexOf(37)>-1) ? 1 : 0;
    x+=(control.input.pressed.indexOf(39)>-1) ? 1 : 0;
    y-=(control.input.pressed.indexOf(38)>-1) ? 1 : 0;
    y+=(control.input.pressed.indexOf(40)>-1) ? 1 : 0;
    control.dir.x=x;
    control.dir.y=y;
    control.primary=control.input.pressed.indexOf(32)>-1;
    control.secondary=control.input.pressed.indexOf(81)>-1;
    control.support=control.input.pressed.indexOf(87)>-1;
    control.ultra=control.input.pressed.indexOf(69)>-1;
  }
  
  var fullspeed=Math.sqrt(Math.pow(control.dir.x,2),Math.pow(control.dir.y,2));
  if(fullspeed>1)
  {
    control.dir.x/=fullspeed;
    control.dir.y/=fullspeed;
  }
  
  control.fighter.speed.x+=this.options.power*control.dir.x;
  control.fighter.speed.y+=this.options.power*control.dir.y;
  
  control.fighter.weaponsToFire=[];
  for(var key in control.fighter.weapons)
  {
    var weapon=control.fighter.weapons[key];
    switch(weapon.slot)
    {
      case 0:
        if(control.primary)
        {
          control.fighter.weaponsToFire.push(weapon);
        }
        break;
      case 1:
        if(control.secondary)
        {
          control.fighter.weaponsToFire.push(weapon);
        }
        break;
      case 2:
        if(control.support)
        {
          control.fighter.weaponsToFire.push(weapon);
        }
        break;
      case 3:
        if(control.ultra)
        {
          control.fighter.weaponsToFire.push(weapon);
        }
        break;
    }
  }
  
  return true;
}

//And ask for this
RomboFight.prototype.takeControl=function(fighter,input)
{
  var control=this.getControlOfPlayer(fighter.player);
  if(!control)
  {
    this.controls.push({
      "dir":{"x":0,"y":0},
      "primary":false,
      "secondary":false,
      "support":false,
      "ultra":false,
      "fighter":fighter,
      "input":input
    });
  }
  else
  {
    control.fighter=fighter;
    control.input=input;
  }
}

//But we can simply do this
RomboFight.prototype.addWeapon=function(fighter,type,slot)
{
  fighter.weapons.push({
    "type":type,
    "slot":slot,
    "cooldown":1,
    "recoil":Array.apply(null, new Array(this.weapons[type].barrels.length)).map(Number.prototype.valueOf,0), //Tomorrow I will figure out how does that shit work, but today it's enough for me
    //Okay, I looked it up in the docs. Nice lazy structure, I'm glad I'm not the only one...
    "barrelID":0
  });
}

//And scare them away
RomboFight.prototype.drawWeapon=function(fighter,weapon)
{
  var weaponProto=this.weapons[weapon.type];
  var point={"x":this.weaponSlots[weapon.slot].x*fighter.sizeRatio,"y":this.weaponSlots[weapon.slot].y*fighter.sizeRatio};
  this.context.save();
  this.context.translate(fighter.pos.x,fighter.pos.y);
  if(!fighter.jedi)
  {
    this.context.rotate(Math.PI);
  }
  this.context.translate(point.x,point.y);
  if(weapon.slot==1)
  {
    this.context.scale(-1,1);
  }
  for(var i=0;i<weaponProto.barrels.length;i++)
  {
    var barrel=weaponProto.barrels[i];
    var image=weaponProto.barrelImages[fighter.player];
    this.drawImageTo(image,{"x":barrel.x*fighter.sizeRatio,"y":(barrel.y-image.height/2+weapon.recoil[i]*barrel.maxRecoil)*fighter.sizeRatio},fighter.sizeRatio);
  }
  this.drawImageTo(weaponProto.images[fighter.player],{"x":0,"y":0},fighter.sizeRatio);
  this.context.restore();
}

//Stop. This is getting serious.
RomboFight.prototype.shootWeapon=function(fighter,weapon)
{
  var weaponProto=this.weapons[weapon.type];
  var shotSuccessful=false;
  if(weaponProto.barrels.length)
  {
    var point={"x":fighter.pos.x+this.weaponSlots[weapon.slot].x*fighter.sizeRatio*(fighter.jedi ? 1 : -1),"y":fighter.pos.y+this.weaponSlots[weapon.slot].y*fighter.sizeRatio*(fighter.jedi ? 1 : -1)};
    var barrel=weaponProto.barrels[weapon.barrelID];
    var image=weaponProto.barrelImages[fighter.player];
    var recoil=weapon.recoil[weapon.barrelID];
    if(weapon.cooldown<=0 && recoil+barrel.recoilPerShot<=1)
    {
      weapon.recoil[weapon.barrelID]+=barrel.recoilPerShot;
      this.missiles.push({
        "pos":{"x":point.x+barrel.x*fighter.sizeRatio*(fighter.jedi ? 1 : -1),"y":point.y+(-barrel.y+image.height-recoil*barrel.maxRecoil)*fighter.sizeRatio*(fighter.jedi ? -1 : 1)},
        "speed":{"x":fighter.speed.x*0.25,"y":fighter.speed.y*0.25+barrel.shotPower*(fighter.jedi ? -1 : 1)},
        "trail":[],
        "sender":fighter,
        "damage":barrel.shotDamage,
        "active":true,
        "trailVanish":barrel.trailVanish
      });
      weapon.cooldown+=1;
      weapon.barrelID++;
      if(weapon.barrelID>=weaponProto.barrels.length)
      {
        weapon.barrelID=0;
      }
      shotSuccessful=true;
    }
  }
  for(var i in weaponProto.effects)
  {
    this.addEffect(fighter,weaponProto.effects[i]);
    shotSuccessful=true;
  }
  if(shotSuccessful)
  {
    fighter.heat+=weaponProto.heat;
  }
}

//Calm the F_WORD down
RomboFight.prototype.coolWeapon=function(weapon)
{
  var weaponProto=this.weapons[weapon.type];
  var cooldown=this.interval*0.001*(weaponProto.freedomPerMinute/60);
  if(weapon.cooldown>0)
  {
    weapon.cooldown-=cooldown;
  }
  for(var i=0;i<weaponProto.barrels.length;i++)
  {
    weapon.recoil[i]=Math.max(0,weapon.recoil[i]-weaponProto.barrels[i].recoilDampener);
  }
}

//That's not how it works. That's not how any of this works.
RomboFight.prototype.moveMissile=function(missile)
{
  if(missile.active)
  {
    var pos=this.cloneObject(missile.pos);
    missile.speed.x+=Math.random()*1-0.5;
    missile.speed.y+=Math.random()*1-0.5;
    missile.pos.x+=missile.speed.x;
    missile.pos.y+=missile.speed.y;
    if(!this.inField(missile.pos))
    {
      missile.active=false;
    }
    missile.trail.unshift({
      "p1":this.cloneObject(missile.pos),
      "p2":pos,
      "o1":2+missile.trailVanish,
      "o2":2
    });
  }
  var removables=[];
  for(var i=0;i<missile.trail.length;i++)
  {
    missile.trail[i].o1-=missile.trailVanish;
    missile.trail[i].o2-=missile.trailVanish;
    if(missile.trail[i].o1<=0 && missile.trail[i].o2<=0)
    {
      removables.push(i);
    }
  }
  removables.sort(function(a, b){return b-a});
  for(var i in removables)
  {
    missile.trail.splice(removables[i],1);
  }
  //missile.trail.splice(removeFrom,Math.max(missile.trail.length-removeFrom,0));
}

//Write a utility function instead of shooting up everyone
RomboFight.prototype.inField=function(point)
{
  return point.x>=0 && point.y>=0 && point.x<=this.canvas.width && point.y<=this.canvas.height;
}

//And draw some missiles right there... wait what?
RomboFight.prototype.drawMissile=function(missile)
{
  var lineWidth=5;
  var breakMissile=(this.options.missileDetail-1)%2;
  if(this.options.missileDetail>1)
  {
    for(var i=0;i<missile.trail.length;i++)
    {
      var trail=missile.trail[i];
      this.context.beginPath();
      this.context.moveTo(trail.p1.x,trail.p1.y);
      this.context.lineTo(trail.p2.x,trail.p2.y);
      var grad=this.context.createLinearGradient(trail.p1.x,trail.p1.y,trail.p2.x,trail.p2.y);
      var startOpacity=breakMissile ? Math.max(missile.trail[0].o1/Math.min(missile.trail.length,4)*(Math.min(missile.trail.length,4)-i)-1,0) : Math.max(trail.o1-1,0);
      var endOpacity=breakMissile ? Math.max(missile.trail[0].o1/Math.min(missile.trail.length,4)*(Math.min(missile.trail.length,4)-i-1)-1,0) : Math.max(trail.o2-1,0);
      grad.addColorStop(0,this.multiplyColor(this.getColorOf(missile.sender.player),startOpacity));
      grad.addColorStop(1,this.multiplyColor(this.getColorOf(missile.sender.player),endOpacity));
      this.context.strokeStyle=grad;
      this.context.lineWidth=lineWidth;
      this.context.lineCap='flat';
      this.context.stroke();
      this.stats.currentDraw.linesDrawn++;
      if(breakMissile && i>=3)
      {
        break;
      }
    }
    lineWidth=2;
  }
  for(var i=0;i<missile.trail.length;i++)
  {
    var trail=missile.trail[i];
    this.context.beginPath();
    this.context.moveTo(trail.p1.x,trail.p1.y);
    this.context.lineTo(trail.p2.x,trail.p2.y);
    var grad=this.context.createLinearGradient(trail.p1.x,trail.p1.y,trail.p2.x,trail.p2.y);
    var startOpacity=breakMissile ? missile.trail[0].o1/Math.min(missile.trail.length,4)*(Math.min(missile.trail.length,4)-i) : trail.o1;
    var endOpacity=breakMissile ? missile.trail[0].o1/Math.min(missile.trail.length,4)*(Math.min(missile.trail.length,4)-i-1) : trail.o2;
    grad.addColorStop(0,this.multiplyColor(this.getColorOf(missile.sender.player),startOpacity));
    grad.addColorStop(1,this.multiplyColor(this.getColorOf(missile.sender.player),endOpacity));
    this.context.strokeStyle=grad;
    this.context.lineWidth=lineWidth;
    this.context.lineCap='flat';
    this.context.stroke();
    this.stats.currentDraw.linesDrawn++;
    if(breakMissile && i>=3)
    {
      break;
    }
  }
}

//Please, STOP THAT
RomboFight.prototype.cleanupMissiles=function()
{
  var removables=[];
  for(var i in this.missiles)
  {
    var missile=this.missiles[i];
    if(!missile.trail.length)
    {
      removables.push(i);
    }
  }
  removables.sort(function(a, b){return b-a});
  for(var i in removables)
  {
    this.missiles.splice(removables[i],1);
  }
}

//And write a utility function, as it's usual when you are angry
RomboFight.prototype.resizeFighter=function(fighter,newsize)
{
  fighter.size.x*=newsize/fighter.sizeRatio;
  fighter.size.y*=newsize/fighter.sizeRatio;
  fighter.sizeRatio=newsize;
}

//Okay, it's time to introduce heal potions
RomboFight.prototype.addEffect=function(fighter,effect)
{
  var effectFound=false;
  for(var i in fighter.effects)
  {
    if(fighter.effects[i].type==effect.type && fighter.effects[i].fallback==effect.fallback)
    {
      fighter.effects[i].strength+=effect.strength;
      effectFound=true;
      break;
    }
  }
  if(!effectFound)
  {
    fighter.effects.push(this.cloneObject(effect));
  }
}

//Just kidding, there is no such thing as a heal potion. Yet. But this function will let you know when it's introduced.
RomboFight.prototype.getEffect=function(fighter,type)
{
  var strength=0;
  for(var i in fighter.effects)
  {
    if(fighter.effects[i].type==type)
    {
      strength+=fighter.effects[i].strength;
    }
  }
  return strength;
}

//One does not simply remove an effect
RomboFight.prototype.removeEffects=function(fighter)
{
  var removables=[];
  for(var i in fighter.effects)
  {
    fighter.effects[i].strength-=fighter.effects[i].fallback;
    if(fighter.effects[i].strength<=0)
    {
      removables.push(i);
    }
  }
  removables.sort(function(a, b){return b-a});
  for(var i in removables)
  {
    fighter.effects.splice(removables[i],1);
  }
}

//This function lets you know what the hell did you just drink
RomboFight.prototype.listEffects=function(fighter)
{
  var effectList=[];
  for(var i in fighter.effects)
  {
    if(effectList.indexOf(fighter.effects[i].type)<0)
    {
      effectList.push(fighter.effects[i].type);
    }
  }
  return effectList;
}

//But there is nothing to hide
RomboFight.prototype.drawEffects=function(fighter)
{
  var effectList=this.listEffects(fighter);
  for(var i in effectList)
  {
    var effect=this.getEffect(fighter,effectList[i]);
    var image=[false,this.images.shield,this.images.bumper]
      [["shield","bumper"].indexOf(effectList[i])+1]; //And finally my favorite lazy structure.
    if(image && effect)
    {
      this.drawImageTo(image,fighter.pos,fighter.sizeRatio,effect);
    }
  }
}

//What are you doing again?
RomboFight.prototype.testMissile=function(missile)
{
  for(var i in this.fighters)
  {
    if(!missile.active)
    {
      continue; //Don't be afraid of shadows
    }
    if(!missile.trail.length)
    {
      continue; //We don't serve standing missiles
    }
    
    var fighter=this.fighters[i];
    
    if(fighter==missile.sender)
    {
      continue; //Self fire prevention script
    }
    if(fighter.jedi==missile.sender.jedi && !this.options.friendlyFire)
    {
      continue; //Friendly fire prevention script
    }
    
    var p1=this.point(fighter.pos.x+fighter.size.x/2,fighter.pos.y); //Left
    var p2=this.point(fighter.pos.x,fighter.pos.y+fighter.size.y/2); //Bottom
    var p3=this.point(fighter.pos.x-fighter.size.x/2,fighter.pos.y); //Right
    var p4=this.point(fighter.pos.x,fighter.pos.y-fighter.size.y/2); //Top
    
    var m1=missile.trail[0].p1;
    var m2=missile.trail[0].p2;
    
    var point=this.point(0,0);
    
    valid=0;
    valid|=this.intersect(p1,p2,m1,m2,point);
    valid|=this.intersect(p2,p3,m1,m2,point);
    valid|=this.intersect(p3,p4,m1,m2,point);
    valid|=this.intersect(p4,p1,m1,m2,point);
    
    if(valid)
    {
      var shieldEffect=Math.min(Math.max(1-this.getEffect(fighter,"shield")*4,0),1);
      if(shieldEffect)
      {
        this.hitFighter(fighter,missile,shieldEffect);
      }
      missile.pos=point;
      missile.trail[0].p1=point;
      missile.active=false;
    }
  }
}

//Stop! You will hurt someone!
RomboFight.prototype.hitFighter=function(fighter,missile,shieldEffect)
{
  if(shieldEffect===undefined)
  {
    shieldEffect=1;
  }
  fighter.health-=missile.damage*shieldEffect;
  if(shieldEffect)
  {
    fighter.lastHit=missile.sender;
  }
}

//And this is the part where we kill them
RomboFight.prototype.sendToAsgard=function()
{
  this.deadFighters.sort(function(a, b){return b-a});
  for(var i in this.deadFighters)
  {
    var fighter=this.fighters[this.deadFighters[i]];
    this.corpses.push({
      "pos":fighter.pos,
      "sizeRatio":fighter.sizeRatio,
      "opacity":1
    })
    this.fighters.splice(this.deadFighters[i],1);
  }
}

//Bad! Asgard is not the place where we send our dead!
RomboFight.prototype.moveCorpse=function(corpse)
{
  corpse.opacity-=this.options.corpseDespawnRate;
  if(corpse.opacity<=0)
  {
    this.removableCorpses.push(this.corpses.indexOf(corpse));
  }
}

//Look at them for the last time
RomboFight.prototype.drawCorpse=function(corpse)
{
  this.drawImageTo(this.images.deadbody,corpse.pos,corpse.sizeRatio,corpse.opacity);
}

//Then hide them away. We don't need them anymore.
RomboFight.prototype.buryCorpses=function()
{
  this.removableCorpses.sort(function(a, b){return b-a});
  for(var i in this.removableCorpses)
  {
    this.corpses.splice(this.removableCorpses[i],1);
  }
}

//Okay, next time we will give them life instead of taking it away
RomboFight.prototype.spawnPlayer=function(player)
{
  var control=this.getControlOfPlayer(player);
  if(control && control.fighter)
  {
    return false;
  }
  
  var options=this.options.players[player];
  var fighter=this.spawnFighter({
    "player":player,
    "jedi":this.colors.length>player
  });
  
  if(options.primary) { this.addWeapon(fighter,options.primary,0); }
  if(options.secondary) { this.addWeapon(fighter,options.secondary,1); }
  if(options.support) { this.addWeapon(fighter,options.support,2); }
  if(options.ultra) { this.addWeapon(fighter,options.ultra,3); }
  
  if(player!=this.colors.length)
  {
    var input=this.getInputByPlayer(player);
  }
  else
  {
    var input={
      "type":"ai",
      "id":this.aiId++
    };
  }
  if(input)
  {
    this.takeControl(fighter,input);
  }
}

//I SAID GIVE IT AND DON'T TAKE IT AWAY
RomboFight.prototype.testCollision=function(fighter1,fighter2,collisionRatio)
{
  var x=Math.abs(fighter1.pos.x-fighter2.pos.x)/(fighter1.size.x+fighter2.size.x)*2;
  var y=Math.abs(fighter1.pos.y-fighter2.pos.y)/(fighter1.size.y+fighter2.size.y)*2;
  if(typeof collisionRatio == "object")
  {
    collisionRatio.x=x;
    collisionRatio.y=y;
  }
  return x+y<1;
}

//Do what the **** you want to
RomboFight.prototype.testFighter=function(fighter)
{
  var exitCollision=true;
  for(var i in this.fighters)
  {
    if(fighter==this.fighters[i])
    {
      continue;
    }
    var collisionRatio=this.point(0,0);
    if(this.testCollision(fighter,this.fighters[i],collisionRatio))
    {
      if(!fighter.inCollision)
      {
        this.damageFighter(fighter,this.fighters[i]);
        this.damageFighter(this.fighters[i],fighter);
        this.collideFighters(fighter,this.fighters[i],collisionRatio);
      }
      exitCollision=false;
    }
  }
  if(exitCollision)
  {
    fighter.inCollision=false;
  }
}

//And see what the **** have you done
RomboFight.prototype.damageFighter=function(fighter,attacker)
{
  var attackEffect=Math.min(this.getEffect(attacker,"bumper")*4,1)+1;
  var defenseEffect=1-Math.min(this.getEffect(fighter,"bumper")*4,1);
  fighter.health-=this.options.collisionDamage*attackEffect*defenseEffect;
  fighter.inCollision=true;
  if(defenseEffect)
  {
    fighter.lastHit=attacker;
  }
}

//I want to write some funny there but I just realized I can't do it for a long time
RomboFight.prototype.collideFighters=function(fighter1,fighter2,collisionRatio)
{
  collisionRatio=collisionRatio || this.point(1,1);
  
  var speed1=this.cloneObject(fighter1.speed);
  var speed2=this.cloneObject(fighter2.speed);
  
  fighter1.speed={
    "x":speed2.x-speed1.x*this.options.rebounceRatio,
    "y":speed2.y-speed1.y*this.options.rebounceRatio
  }
  fighter2.speed={
    "x":speed1.x-speed2.x*this.options.rebounceRatio,
    "y":speed1.y-speed2.y*this.options.rebounceRatio
  }
  
  fighter1.pos={
    "x":fighter1.pos.x-(fighter1.size.x+fighter2.size.x)/4*collisionRatio.x*speed1.x/(Math.abs(speed1.x)+Math.abs(speed2.x) || 1),
    "y":fighter1.pos.y-(fighter1.size.y+fighter2.size.y)/4*collisionRatio.y*speed1.y/(Math.abs(speed1.y)+Math.abs(speed2.y) || 1)
  }
  fighter2.pos={
    "x":fighter2.pos.x-(fighter1.size.x+fighter2.size.x)/4*collisionRatio.x*speed2.x/(Math.abs(speed1.x)+Math.abs(speed2.x) || 1),
    "y":fighter2.pos.y-(fighter1.size.y+fighter2.size.y)/4*collisionRatio.y*speed2.y/(Math.abs(speed1.y)+Math.abs(speed2.y) || 1)
  }
}

//So I considered to draw something funny instead
RomboFight.prototype.drawHud=function(player,slot)
{
  var hudOrigin=this.point(this.options.hudSize*(Number(slot)+0.5)*this.options.hudGap,this.canvas.height-this.options.hudSize*this.options.hudGap/2);
  var hudColor=this.getColorOf(player);
  var control=this.getControlOfPlayer(player);
  var fighter=control.fighter;
  this.context.beginPath();
  this.context.arc(hudOrigin.x,hudOrigin.y,this.options.hudSize/2,0,Math.PI*2);
  this.context.fillStyle=this.multiplyColor("#000000",this.options.hudOpacity);
  this.context.fill();
  if(control && fighter)
  {
    this.context.lineWidth=this.options.hudWidth;
    this.context.beginPath();
    this.context.arc(hudOrigin.x,hudOrigin.y,this.options.hudSize/2,Math.PI*1.5,Math.PI*1.5+Math.PI*2*fighter.health);
    this.context.strokeStyle="#"+hudColor;
    this.context.stroke();
    if(fighter.heat>=0)
    {
      this.context.beginPath();
      this.context.arc(hudOrigin.x,hudOrigin.y,this.options.hudSize/2-this.options.hudWidth*2,Math.PI*1.5,Math.PI*1.5+Math.PI*2*fighter.heat/this.options.maxHeat);
      this.context.strokeStyle='#dddddd';
      this.context.stroke();
    }
    var effectList=this.listEffects(fighter);
    for(var i in effectList)
    {
      var effect=Math.min(this.getEffect(fighter,effectList[i]),1);
      this.context.beginPath();
      this.context.arc(hudOrigin.x,hudOrigin.y,Math.max(this.options.hudSize/2-this.options.hudWidth*2*(i+2),0),Math.PI*1.5,Math.PI*1.5+Math.PI*2*effect);
      this.context.strokeStyle=["#dddddd","#00e7e7","#e76e00"][["shield","bumper"].indexOf(effectList[i])+1];
      this.context.stroke();
    }
  }
  else
  {
    var offset=window.performance.now()*this.options.hudSpeed+player*this.options.hudOffset;
    this.context.beginPath();
    this.context.arc(hudOrigin.x,hudOrigin.y,this.options.hudSize/2,offset,Math.PI*this.options.hudAngle+offset);
    this.context.strokeStyle="#"+hudColor;
    this.context.stroke();
  }
  var text=this.stats.players[player].kills;
  this.context.fillStyle="#dddddd";
  this.context.font="10px Ubuntu";
  var measure=this.context.measureText(text);
  var ratio=(this.options.hudSize/3)/measure.width;
  var fontSize=Math.floor(10*ratio);
  this.context.font=fontSize+"px Ubuntu";
  this.context.textAlign="center";
  this.context.fillText(text,hudOrigin.x,hudOrigin.y+fontSize/3);
}

//But not with this function. So no comments for you, figure out yourself.
RomboFight.prototype.spawnSides=function(light,dark)
{
  if(light)
  {
    for(var i in this.inputs)
    {
      this.spawnPlayer(this.getPlayerId(this.inputs[i].color));
    }
  }
  if(dark)
  {
    var sithCount=this.countSide(false); //Anything else than 2 is invalid
    for(var i=0;i<this.inputs.length*this.options.enemyPerPlayer-sithCount;i++)
    {
      this.spawnPlayer(this.colors.length);
    }
  }
}

//True = light side, false = dark side  //That's racist
RomboFight.prototype.checkSide=function(light)
{
  var side=false;
  for(var i in this.fighters)
  {
    if(this.fighters[i].jedi==light)
    {
      side=true;
    }
  }
  return side;
}

//Next function will be called checkMate...
RomboFight.prototype.checkMatch=function()
{
  if(!this.inputs.length)
  {
    this.endGame(); //If no one is here, the game ends immediately
  }
  
  var match=this.checkSide(true) && this.checkSide(false);
  
  if(match)
  {
    if(this.stats.matchless)
    {
      this.stats.matchless=0;
    }
  }
  else
  {
    this.stats.matchless++;
  }
  
  if(this.stats.matchless>this.options.matchDelay)
  {
    //Okay, it looks like somebody just won.
    this.checkMate(true);
  }
}

//As I promised
RomboFight.prototype.checkMate=function(spawn)
{
  var lightside=this.checkSide(true);
  var darkside=this.checkSide(false);
  
  if(!lightside && !darkside)
  {
    this.stats.wins++; //Continue being racist.
    this.stats.loses++; //Dark side is not side
    this.notify('Tie round');
    if(spawn)
    {
      this.spawnSides(true,true);
    }
  }
  else if(lightside)
  {
    this.stats.wins++;
    this.notify('You won this round');
    if(spawn)
    {
      this.spawnSides(this.options.respawnWinner,true);
    }
  }
  else if(darkside)
  {
    this.stats.loses++;
    this.notify('You lose this round');
    if(spawn)
    {
      this.spawnSides(true,this.options.respawnWinner);
    }
  }
}

//Utility functions. Again.
RomboFight.prototype.countSide=function(light)
{
  var count=0;
  for(var i in this.fighters)
  {
    if(this.fighters[i].jedi==light)
    {
      count++;
    }
  }
  return count;
}

//Boring. Let's write an AI instead.
RomboFight.prototype.rollAi=function()
{
  var tickdata={
    "fighters":[],
    "missiles":[],
    "controls":[],
    "type":"tick",
    "field":{
      "width":this.canvas.width,
      "height":this.canvas.height
    },
    "tick":this.tickId
  };
  
  for(var i in this.fighters)
  {
    tickdata.fighters.push({
      "effects":this.cloneObject(this.fighters[i].effects),
      "health":this.fighters[i].health,
      "heat":this.fighters[i].heat,
      "id":this.fighters[i].id,
      "inCollision":this.fighters[i].inCollision,
      "jedi":this.fighters[i].jedi,
      "lastHit":this.fighters[i].lastHit.id,
      "overheat":this.fighters[i].overheat,
      "pos":this.cloneObject(this.fighters[i].pos),
      "speed":this.cloneObject(this.fighters[i].speed),
      "size":this.cloneObject(this.fighters[i].size),
      "sizeRatio":this.fighters[i].sizeRatio,
      "weapons":this.cloneObject(this.fighters[i].weapons)
    });
  }
  for(var i in this.missiles)
  {
    if(this.missiles[i].active)
    {
      tickdata.missiles.push({
        "pos":this.cloneObject(this.missiles[i].pos),
        "speed":this.cloneObject(this.missiles[i].speed),
        "sender":this.missiles[i].sender.id,
        "damage":this.missiles[i].damage
      });
    }
  }
  for(var i in this.controls)
  {
    if(this.controls[i].input.type=="ai" && this.controls[i].fighter.health>0)
    {
      var control=this.cloneObject(this.controls[i]);
      control.fighter=this.controls[i].fighter.id;
      tickdata.controls.push(control);
    }
  }
  
  if(JSON.stringify(this.options)!=JSON.stringify(this.prevOptions))
  {
    this.prevOptions=this.cloneObject(this.options);
    tickdata.options=this.cloneObject(this.options);
  }
  
  this.aiTicks.unshift(tickdata);
  if(this.aiTicks.length>this.options.aiDelay)
  {
    this.callAi(this.aiTicks[this.options.aiDelay-1]);
    this.aiTicks.splice(this.options.aiDelay-1,Infinity);
  }
}

//This function gives the AI an outdated data about the current field.
RomboFight.prototype.callAi=function(tickdata)
{
  tickdata.delay=this.tickId-tickdata.tick;
  
  var sithdata=this.cloneObject(tickdata);
  var jedidata=this.cloneObject(tickdata);
  sithdata.controls=[];
  jedidata.controls=[];
  
  var data;
  for(var i in tickdata.controls)
  {
    data=tickdata.controls[i].fighter.jedi ? jedidata : sithdata;
    data.controls.push(tickdata.controls[i]);
  }
  
  for(var i in jedidata.fighters)
  {
    jedidata.fighters[i].pos.x*=-1;
    jedidata.fighters[i].pos.y*=-1;
    jedidata.fighters[i].speed.x*=-1;
    jedidata.fighters[i].speed.y*=-1;
    jedidata.fighters[i].jedi=!jedidata.fighters[i].jedi;
  }
  for(var i in jedidata.missiles)
  {
    jedidata.missiles[i].pos.x*=-1;
    jedidata.missiles[i].pos.y*=-1;
    jedidata.missiles[i].speed.x*=-1;
    jedidata.missiles[i].speed.y*=-1;
  }
  for(var i in jedidata.controls)
  {
    jedidata.controls[i].dir.x*=-1;
    jedidata.controls[i].dir.y*=-1;
  }
  
  if(this.options.logAiData)
  {
    console.log(sithdata,jedidata);
    this.options.logAiData=false;
  }
  
  this.sithAi.postMessage(sithdata);
  this.jediAi.postMessage(jedidata);
}

//And this is the callback to press the buttons of AI
RomboFight.prototype.reactToAi=function(response,jedi)
{
  if(Array("game").indexOf(this.mode)>-1) //I should make an array for game modes
  {
    var data=response.data;
    if(data.type=="debug")
    {
      console.log(data.message);
    }
    else if(data.type=="control")
    {
      for(var i in data.controls)
      {
        var control=this.getAiControl(data.controls[i].input.id);
        control.dir.x=data.controls[i].dir.x*(jedi ? -1 : 1);
        control.dir.y=data.controls[i].dir.y*(jedi ? -1 : 1);
        control.primary=data.controls[i].primary;
        control.secondary=data.controls[i].secondary;
        control.support=data.controls[i].support;
        control.ultra=data.controls[i].ultra;
      }
    }
  }
}

//Utility functions for the win
RomboFight.prototype.getAiControl=function(id)
{
  for(var i in this.controls)
  {
    if(this.controls[i].input.type=="ai" && this.controls[i].input.id==id)
    {
      return this.controls[i];
    }
  }
  return false;
}

//Why do I need to clean up after everything? Why can't the code have OCD?
RomboFight.prototype.cleanupAi=function()
{
  var removables=[];
  for(var i in this.controls)
  {
    var control=this.controls[i];
    if(control.input.type=="ai" && control.fighter.health<=0)
    {
      removables.push(i);
    }
  }
  removables.sort(function(a, b){return b-a});
  for(var i in removables)
  {
    this.controls.splice(removables[i],1);
  }
}

//These comments gone a little bit useless...
//But there is a utility function for you
RomboFight.prototype.getControlOfPlayer=function(player)
{
  for(var i in this.controls)
  {
    if(this.getPlayerId(this.controls[i].input.color)==player)
    {
      return this.controls[i];
    }
  }
  return false;
}
//This function will always be at the end. Always.
//I hate myself so much for this poor and meaningless Harry Potter reference.
