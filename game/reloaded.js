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
}

//Inheritance
RomboFight.prototype=RomboEngine.prototype;
