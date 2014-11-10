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
          if(choices[0].name=="locgame")
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
    "heat":this.loadImage("game/images/heat.png")
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
          "shotDamage":128,
          "trailVanish":0.05
        }
      ],
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
          "shotDamage":64,
          "trailVanish":0.05
        },
        {
          "x":10,
          "y":7.5,
          "recoilPerShot":0.25,
          "maxRecoil":20,
          "recoilDampener":0.05,
          "shotPower":50,
          "shotDamage":64,
          "trailVanish":0.05
        }
      ],
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
      "barrels":[],
      "heat":0.05,
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
}

//The most underrated code ever.
//It does everything, but no one cares until it becomes slow.
RomboFight.prototype.gameTick=function()
{
  if(Array("game").indexOf(this.mode)>-1) //The second laziest structure I've ever designed. I'm so proud of myself.
  {
    for(var i=0;i<this.controls.length;i++)
    {
      this.useControl(this.controls[i]);
    }
    for(var i=0;i<this.fighters.length;i++)
    {
      this.moveFighter(this.fighters[i]);
      for(j=0;j<this.fighters[i].weapons.length;j++)
      {
        this.coolWeapon(this.fighters[i].weapons[j]);
      }
    }
    for(var i=0;i<this.missiles.length;i++)
    {
      this.moveMissile(this.missiles[i]);
    }
  }
}

//Sorry, I wasn't right. If anything becomes slow, they blame THIS code.
RomboFight.prototype.gameDraw=function()
{
  if(this.drawWarning)
  {
    this.context.fillStyle="#ff0000";
    this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
    this.drawWarning=false;
  }
  if(Array("game").indexOf(this.mode)>-1) //See?
  {
    for(var i=0;i<this.fighters.length;i++)
    {
      this.drawFighter(this.fighters[i]);
    }
    for(var i=0;i<this.missiles.length;i++)
    {
      this.drawMissile(this.missiles[i]);
    }
  }
}

//But OK, let's do something less underrated
RomboFight.prototype.spawnFighter=function(fighterdata)
{
  this.fighters.push({
    "pos":{"x":120,"y":120},
    "speed":{"x":0,"y":0},
    "size":{"x":50,"y":80},
    "sizeRatio":0.2,
    "health":1,
    "heat":0,
    "effects":[],
    "player":fighterdata.player,
    "weapons":[],
    "weaponsToFire":[],
    "jedi":(fighterdata.jedi!==undefined) ? fighterdata.jedi : true //This specifies the side it'll fight on if you don't understand for some reason
  })
}

//You can even see this in action
RomboFight.prototype.moveFighter=function(fighter)
{
  var realSpeed=Math.sqrt(Math.pow(fighter.speed.x,2)+Math.pow(fighter.speed.y,2));
  var drag=Math.pow(realSpeed,2)*0.0064;
  if(realSpeed)
  {
    fighter.speed.x-=fighter.speed.x*drag/realSpeed;
    fighter.speed.y-=fighter.speed.y*drag/realSpeed;
  }
  
  var realSpeed=Math.sqrt(Math.pow(fighter.speed.x,2)+Math.pow(fighter.speed.y,2));
  var friction=Math.min(realSpeed,1);
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
    fighter.heat-=0.015;
  }
  for(var key in fighter.weaponsToFire)
  {
    var weaponProto=this.weapons[fighter.weaponsToFire[key].type];
    if(fighter.heat+weaponProto.heat<=1)
    {
      this.shootWeapon(fighter,fighter.weaponsToFire[key]);
    }
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
}

//But they will respect this function immediately when we turn it off
RomboFight.prototype.useControl=function(control)
{
  if(control.input.type=="gamepad")
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
  else if(control.input.type=="keyboard")
  {
    var x=0;
    var y=0;
    x-=(control.input.pressed.indexOf(37)>-1) ? 1 : 0;
    x+=(control.input.pressed.indexOf(39)>-1) ? 1 : 0;
    y-=(control.input.pressed.indexOf(38)>-1) ? 1 : 0;
    y+=(control.input.pressed.indexOf(40)>-1) ? 1 : 0;
    control.dir.x=x;
    control.dir.y=y;
  }
  
  var fullspeed=Math.sqrt(Math.pow(control.dir.x,2),Math.pow(control.dir.y,2));
  if(fullspeed>1)
  {
    control.dir.x/=fullspeed;
    control.dir.y/=fullspeed;
  }
  
  control.fighter.speed.x+=25*control.dir.x;
  control.fighter.speed.y+=25*control.dir.y;
  
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
}

//And ask for this
RomboFight.prototype.takeControl=function(fighter,input)
{
  this.controls.push({
    "dir":{"x":0,"y":0},
    "primary":false,
    "secondary":false,
    "support":false,
    "ultra":false,
    "fighter":fighter,
    "input":input
  })
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
    this.drawImageTo(image,{"x":barrel.x*fighter.sizeRatio,"y":(barrel.y-image.height/2+weapon.recoil[i]*barrel.maxRecoil*(fighter.jedi ? 1 : -1))*fighter.sizeRatio},fighter.sizeRatio);
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
      this.missiles.push({
        "pos":{"x":point.x+barrel.x*fighter.sizeRatio*(fighter.jedi ? 1 : -1),"y":point.y+(barrel.y+image.height*(fighter.jedi ? -1 : 1)+recoil*barrel.maxRecoil*(fighter.jedi ? 1 : -1))*fighter.sizeRatio},
        "speed":{"x":fighter.speed.x*0.25,"y":fighter.speed.y*0.25+barrel.shotPower*(fighter.jedi ? -1 : 1)},
        "trail":[],
        "sender":fighter,
        "damage":barrel.shotDamage,
        "active":true,
        "trailVanish":barrel.trailVanish
      });
      weapon.cooldown+=1;
      weapon.recoil[weapon.barrelID]+=barrel.recoilPerShot;
      weapon.barrelID++;
      if(weapon.barrelID>=weaponProto.barrels.length)
      {
        weapon.barrelID=0;
      }
      shotSuccessful=true;
    }
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
    missile.trail.push({
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
  for(var i=0;i<missile.trail.length;i++)
  {
    var trail=missile.trail[i];
    this.context.beginPath();
    this.context.moveTo(trail.p1.x,trail.p1.y);
    this.context.lineTo(trail.p2.x,trail.p2.y);
    var grad=this.context.createLinearGradient(trail.p1.x,trail.p1.y,trail.p2.x,trail.p2.y);
    grad.addColorStop(0,this.multiplyColor(this.getColorOf(missile.sender.player),Math.max(trail.o1-1,0)));
    grad.addColorStop(1,this.multiplyColor(this.getColorOf(missile.sender.player),Math.max(trail.o2-1,0)));
    this.context.strokeStyle=grad;
    this.context.lineWidth=5;
    this.context.lineCap='flat';
    this.context.stroke();
  }
  for(var i=0;i<missile.trail.length;i++)
  {
    var trail=missile.trail[i];
    this.context.beginPath();
    this.context.moveTo(trail.p1.x,trail.p1.y);
    this.context.lineTo(trail.p2.x,trail.p2.y);
    var grad=this.context.createLinearGradient(trail.p1.x,trail.p1.y,trail.p2.x,trail.p2.y);
    grad.addColorStop(0,this.multiplyColor(this.getColorOf(missile.sender.player),trail.o1));
    grad.addColorStop(1,this.multiplyColor(this.getColorOf(missile.sender.player),trail.o2));
    this.context.strokeStyle=grad;
    this.context.lineWidth=2;
    this.context.lineCap='flat';
    this.context.stroke();
  }
}
