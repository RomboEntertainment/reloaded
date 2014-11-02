// RomboFight Reloaded
// (cc) Licensed under Creative Commons CC-BY-NC by Elemential 2014

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
}
//Inheritance
RomboFight.prototype=RomboEngine.prototype;

//Hook the main menu from the engine
RomboFight.prototype.gameMenu=function()
{
  this.createMenu(this.menuSystem.mainMenu);
}

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
    for(var i=0;i<this.fighters.length;i++)
    {
      this.moveFighter(this.fighters[i]);
    }
  }
}

//Sorry, I wasn't right. If anything becomes slow, they blame THIS code.
RomboFight.prototype.gameDraw=function()
{
  if(Array("game").indexOf(this.mode)>-1) //See?
  {
    for(var i=0;i<this.fighters.length;i++)
    {
      this.drawFighter(this.fighters[i]);
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
    "health":1,
    "heat":0,
    "effects":[],
    "player":fighterdata.player,
    "weapons":[]
  })
}

RomboFight.prototype.moveFighter=function(fighter)
{
  var realSpeed=Math.sqrt(Math.pow(fighter.speed.x,2)+Math.pow(fighter.speed.y,2));
  var drag=Math.pow(realSpeed,2)*0.0001;
  fighter.speed.x-=(fighter.speed.x) ? fighter.speed.x*drag/realSpeed : 0;
  fighter.speed.y-=(fighter.speed.y) ? fighter.speed.y*drag/realSpeed : 0;
  
  var realSpeed=Math.sqrt(Math.pow(fighter.speed.x,2)+Math.pow(fighter.speed.y,2));
  var friction=Math.min(realSpeed,1);
  fighter.speed.x-=(fighter.speed.x) ? fighter.speed.x*friction/realSpeed : 0;
  fighter.speed.y-=(fighter.speed.y) ? fighter.speed.y*friction/realSpeed : 0;
   
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
}

RomboFight.prototype.drawFighter=function(fighter)
{
  this.drawImageTo(this.images.base,fighter.pos,0.2);
  this.drawImageTo(this.playerImages.base[fighter.player],fighter.pos,0.2,fighter.health);
  this.drawImageTo(this.playerImages.fighter[fighter.player],fighter.pos,0.2);
  this.drawImageTo(this.images.heat,fighter.pos,0.2,fighter.heat);
}
