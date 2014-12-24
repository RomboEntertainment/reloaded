// RomboFight Reloaded AI system
// Original version, based on the AI of RomboFight 2
// (cc) Licensed under Creative Commons CC-BY-NC by Three Universe Studios 2014

var options, weapons, fighters, missiles, field, weaponSlots;
var controls=[];

var lastData, lastFighters, lastWorthy, lastEstimate, lastEnemy;
var visualize=false;

function getControlById(id)
{
  for(var i in controls)
  {
    if(controls[i].id==id)
    {
      return controls[i];
    }
  }
  return false;
}

function getFighterById(id)
{
  for(var i in fighters)
  {
    if(fighters[i].id==id)
    {
      return fighters[i];
    }
  }
  return false;
}

function findNewEnemy(control)
{
  var values=[];
  var sumValues=0;
  
  for(var i in fighters)
  {
    var fighter=fighters[i];
    
    var distance=Math.abs(control.target.x-fighter.pos.x);
    var value=1/distance;
    
    value*=Math.max(1-getEffect(fighter,"shield"),0);
    value*=fighter.heat*0.5+0.5;
    value*=(1-fighter.health)*0.5+0.5;
    value*=fighter.jedi;
    
    values.push(value);
    sumValues+=value;
  }
  
  lastFighters=values;
  
  if(values.length)
  {
    var enemy=Math.random()*sumValues;
    var valueStep=0;
    for(var i in values)
    {
      if(valueStep+values[i]>enemy)
      {
        return fighters[i].id;
      }
      valueStep+=values[i];
    }
  }
  return -1;
}

function getNewTarget(control)
{
  var target={"x":0,"y":0};
  var fighter=getFighterById(control.fighter);
  var enemy=getFighterById(control.enemy);
  lastEnemy=enemy;
  if(enemy)
  {
    var worthToAttack=
      (options.maxHeat-fighter.heat)/options.maxHeat* //If the enemy is high on heat
      (enemy.heat+options.maxHeat)/options.maxHeat*2* //If the fighter is low on heat
      (Math.min(1-getEffect(enemy,"shield"),0)+1)/2*  //If the enemy has low shield
      (Math.max(getEffect(fighter,"shield"),1)+1)/2;  //If the fighter has high shield
    
    lastWorthy=worthToAttack;
    
    if(worthToAttack>0.5)
    {
      target.x=enemy.pos.x+Math.random(); //15-7.5; //That magic shall not pass
      target.y=enemy.pos.y*Math.random();
      if(!control.attacking)
      {
        //console.log("AI "+control.id+" is attacking "+control.enemy);
      }
      control.attacking=true;
      return target;
    }
  }
  target.x=Math.random()*field.width;
  target.y=Math.random()*field.height;
  if(control.attacking)
  {
    //console.log("AI "+control.id+" is evading");
  }
  control.attacking=false;
  return target;
}

function getEffect(fighter,type) //Pasted from the game code
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

function getBrakeLength(speed)
{
  var brakeLength={"x":0,"y":0};
  var speed={"x":speed.x,"y":speed.y};
  do {
    var realSpeed=Math.sqrt(Math.pow(speed.x,2)+Math.pow(speed.y,2));
    var drag=Math.pow(realSpeed,2)*options.drag;
    if(realSpeed)
    {
      speed.x-=speed.x*drag/realSpeed;
      speed.y-=speed.y*drag/realSpeed;
    }
    
    var realSpeed=Math.sqrt(Math.pow(speed.x,2)+Math.pow(speed.y,2));
    var friction=Math.min(realSpeed,options.friction);
    if(realSpeed)
    {
      speed.x-=speed.x*friction/realSpeed;
      speed.y-=speed.y*friction/realSpeed;
    }
    
    var realSpeed=Math.sqrt(Math.pow(speed.x,2)+Math.pow(speed.y,2));
    brakeLength.x+=speed.x;
    brakeLength.y+=speed.y;
  } while (realSpeed>0)
  return brakeLength;
}

function getWeapon(fighter,slot)
{
  for(var i in fighter.weapons)
  {
    if(fighter.weapons[i].slot==slot)
    {
      return fighter.weapons[i];
    }
  }
  return false;
}

function estimateShot(pos,speed,target,threshold)
{
  lastEstimate=[pos,speed,target,threshold];  
  
  if(speed.y==0)
  {
    return false;
  }
  var ratio=speed.x/speed.y;
  var distance={
    "x":target.x-pos.x,
    "y":target.y-pos.y
  };
  var offset=distance.y*ratio;
  var hitDistance=distance.x-offset;
  return Math.abs(hitDistance)<threshold;
}

function visualizePoint(point,strength,size)
{
  var p={};
  if(point)
  {
    p.x=point.x;
    p.y=point.y;
  }
  if(strength)
  {
    p.strength=point.strength;
  }
  if(size)
  {
    p.size=point.size;
  }
  return p;
}

onmessage=function(event) {
  var data=event.data;
  if(data.type=="tick")
  {
    lastData=data;
    
    var response={
      "controls":data.controls,
      "points":[],
      "type":"control"
    }
    
    fighters=data.fighters;
    missiles=data.missiles;
    field=data.field;
    
    if("options" in data)
    {
      options=data.options;
    }
    
    //Loop through everything we'll need to control
    for(var i=0;i<data.controls.length;i++)
    {
      if(!getControlById(data.controls[i].input.id))
      {
        var index=controls.push({
          "id":data.controls[i].input.id,
          "enemy":-1,
          "target":{
            "x":0,
            "y":0
          },
          "targeted":0,
          "fighter":data.controls[i].fighter,
          "attacking":false
        });
        var control=getControlById(data.controls[i].input.id);
        control.enemy=findNewEnemy(control);
        control.target=getNewTarget(control);
      }
      
      var control=getControlById(data.controls[i].input.id);
      var fighter=getFighterById(control.fighter);
      
      if(fighter)
      {
        var distance=fighter ? Math.sqrt(
          Math.pow(Math.abs(control.target.x-fighter.pos.x),2)+
          Math.pow(Math.abs(control.target.y-fighter.pos.y),2)
        ) : 0;
        
        control.targeted++;
        if(control.targeted>distance/16)
        {
          control.enemy=findNewEnemy(control);
          control.target=getNewTarget(control);
          control.targeted=0;
        }
        
        var brakeLength=getBrakeLength(fighter.speed);
        var brakeDistance=fighter ? Math.sqrt(
          Math.pow(Math.abs(brakeLength.x),2)+
          Math.pow(Math.abs(brakeLength.y),2)
        ) : 0;
        var speed=brakeDistance ? Math.min(distance/brakeDistance,1) : 1;
        var xRatio=brakeDistance ? Math.abs(brakeLength.x/brakeDistance) : 1;
        var yRatio=brakeDistance ? Math.abs(brakeLength.y/brakeDistance) : 1;
        response.controls[i].dir.x=((fighter.pos.x+fighter.speed.x*data.delay+brakeLength.x*3<control.target.x) ? speed : -speed)*xRatio; //3 is a magic number here. Much better than pi.
        response.controls[i].dir.y=((fighter.pos.y+fighter.speed.y*data.delay+brakeLength.y*3<control.target.y) ? speed : -speed)*yRatio; //Just kidding, no idea which number would be correct...
        
        var shootPrimary=false;
        var shootSecondary=false;
        var enemy=getFighterById(control.enemy);
        if(enemy)
        {
          var primary=getWeapon(fighter,0);
          var pos={"x":fighter.pos.x+weaponSlots[0].x*fighter.sizeRatio+fighter.speed.x*data.delay,"y":fighter.pos.y+weaponSlots[0].y*fighter.sizeRatio+fighter.speed.y*data.delay};
          var speed={"x":fighter.speed.x*0.25,"y":fighter.speed.y*0.25+weapons[primary.type].barrels[primary.barrelID].shotPower};
          var target={"x":enemy.pos.x+enemy.speed.x*data.delay,"y":enemy.pos.y+enemy.speed.y*data.delay};
          shootPrimary=estimateShot(pos,speed,target,enemy.size.x*3);
          shootSecondary=estimateShot(pos,speed,target,enemy.size.x);
          if(visualize)
          {
            response.points.push(visualizePoint(pos,3));
            response.points.push(visualizePoint(target,3));
          }
        }
        
        response.controls[i].primary=shootPrimary;
        response.controls[i].secondary=shootSecondary;
      }
    }
    
    //console.log(response.points);
    postMessage(response);
  }
  if(data.type=="init")
  {
    options=data.options;
    weapons=data.weapons;
    weaponSlots=data.weaponSlots;
  }
  if(data.type=="debug")
  {
    if(data.action=="controls")
    {
      console.log(controls);
    }
    if(data.action=="data")
    {
      console.log(lastData);
    }
    if(data.action=="fighters")
    {
      console.log(lastFighters);
    }
    if(data.action=="thor")
    {
      console.log(lastEnemy,lastWorthy);
    }
    if(data.action=="guess")
    {
      console.log(lastEstimate);
    }
    if(data.action="visualize")
    {
      visualize=!visualize;
    }
  }
}
