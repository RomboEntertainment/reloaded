// Rombo Game Background
// (cc) Licensed under Creative Commons CC-BY-NC by Three Universe Studios 2014

//Constructor
RomboBackground=function(input)
{  
  //Get the game controller from input 
  this.gameController=input.gameController;
  
  //Setup the actual background pattern
  this.lines=[];
  this.canAdd=true;
  
  //Get the interval values, cuz they're cool
  this.interval=('interval' in input) ? input.interval : 42;
  this.pauseInterval=('pauseInterval' in input) ? pauseInterval.interval : 420;
  
  //Setup intervals, cuz we found out they aren't
  var self=this;
  setInterval(function()
  {
    self.canAdd=!self.canAdd;
  },this.pauseInterval);
  setInterval(function()
  {
    if(self.canAdd)
    {
      self.add();
    }
  },this.interval);
}

//Tick function, that moves everything but the ship
RomboBackground.prototype.tick=function()
{
  var ls=this.lines;
  for(var i=0;i<ls.length;i++)
  {
    var l=ls[i];
    l.life=l.life-1;
    if(l.life<=0)
    {
      ls.splice(i,1);
    }
  }
}

//Draw function because telepathy isn't compatibile with Bluetooth
RomboBackground.prototype.draw=function()
{
  var ls=this.lines;
  var ctx=this.gameController.context;
  for(var i=0;i<ls.length;i++)
  {
    var l=ls[i];
    var y=this.gameController.canvas.height;
    ctx.beginPath();
    ctx.moveTo(l.x,0);
    ctx.lineTo(l.left ? l.x-y : l.x+y,y);
    ctx.strokeStyle='rgba('+l.color.r+','+l.color.g+','+l.color.b+','+0.5*l.life/l.origlife+')';
    ctx.lineWidth=1;
    ctx.lineCap="butt";
    ctx.stroke();
  }
}

//This function introduces lines that actually do something
RomboBackground.prototype.add=function()
{
  var life=Math.floor((Math.random()*50)+1)+50;
  var left=Math.random()<.5;
  var x=Math.floor((Math.random()*(this.gameController.canvas.width+this.gameController.canvas.height))+1);
  x=left ? x : x-this.gameController.canvas.height;
  var ls=this.lines;
  ls.push({
    "life":life,
    "origlife":life,
    "color":(Math.random()<.5) ? {'r':255,'g':0,'b':0} : {'r':0,'g':255,'b':0},
    "x":x,
    "left":left
  });
}
