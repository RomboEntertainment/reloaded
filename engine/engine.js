// Rombo Game Engine
// (cc) Licensed under Creative Commons CC-BY-NC by Elemential 2014

//Constructor, in case you didn't notice
RomboEngine=function(input)
{
  //Selfish code is !important
  var self=this;
  
  //Element creation
  this.canvas=document.createElement('canvas');
  this.context=this.canvas.getContext('2d');
  
  this.holder=document.createElement('div'); //Gameholder
  this.holder.style.width="100%";
  this.holder.style.height="100%";
  this.holder.style.overflow="hidden";
  this.holder.style.position="relative";
  this.holder.classList.add('rombo-engine-gameholder');
  this.holder.appendChild(this.canvas);
  
  this.notifholder=document.createElement('div'); //Notification holder
  this.notifholder.style.position="absolute";
  this.notifholder.style.left="40px";
  this.notifholder.style.bottom="16px";
  this.notifholder.classList.add('rombo-engine-notifholder');
  this.holder.appendChild(this.notifholder);
  
  this.menuholder=document.createElement('div'); //Menu holder
  this.menuholder.style.position="absolute";
  this.menuholder.style.transition="top 0.5s, opacity 0.5s";
  this.menuholder.classList.add('rombo-engine-menuholder');
  this.holder.appendChild(this.menuholder);
  
  //No more holders. What did you expect?
  
  if('gameholder' in input) //Check if we need to put this somewhere
  {
    input.gameholder.appendChild(this.holder);
    if(input.gameholder==document.body)
    {
      input.gameholder.style.position="absolute";
      input.gameholder.style.width="100%";
      input.gameholder.style.height="100%";
      input.gameholder.style.overflow="hidden";
      input.gameholder.style.margin="0";
    }
    var self=this;
    addEventListener('resize',function(){self.resizeCanvas.call(self)});
    this.resizeCanvas();
  }
  
  //Initialize menu system and input devices
  var gamepadsEnabled=('getGamepads' in navigator);
  this.mode="menu";
  this.menu="init";
  this.inputs=[];
  if(gamepadsEnabled)
  {
    this.gamepads=[];
    var gamepads=navigator.getGamepads();
    for(var i=0;i<gamepads.length;i++)
    {
      if(gamepads[i])
      {
        this.gamepads.push({
          "index":gamepads[i].index,
          "timestamp":gamepads[i].timestamp
        });
      }
    }
  }
  
  //Init input colors
  this.colors=["#00ff00","ffc800","ffffff","003cff","808080"]; //These are our basic colors, you are free to override it
  this.colorSettings=[ //Settings per color. Surprise, surprise...
    {
      "name": "Green",
      "image": this.loadImage("engine/images/green.png")
    },
    {
      "name": "Yellow",
      "image": this.loadImage("engine/images/yellow.png")
    },
    {
      "name": "White",
      "image": this.loadImage("engine/images/white.png")
    },
    {
      "name": "Blue",
      "image": this.loadImage("engine/images/blue.png")
    },
    {
      "name": "Grey",
      "image": this.loadImage("engine/images/grey.png")
    }
  ];
  
  //Donkey function. Ha-ha.
  window.addEventListener('keydown',function(event){
    //Drop in system, because unfortunately not everyone has a gamepad.
    var keyboardIsDroppedIn=false;
    var keyboardInput;
    for(i=0;i<self.inputs.length;i++)
    {
      if(self.inputs[i].type=="keyboard")
      {
        keyboardIsDroppedIn=true;
        keyboardInput=i;
      }
    }
    if(!keyboardIsDroppedIn)
    {
      self.dropIn({
        "type":"keyboard",
        "settings":[],
        "deviceName":"Keyboard",
        "pressed":[],
        "justPressed":[]
      })
    }
    else
    {
      var input=self.inputs[keyboardInput];
      input.pressed.push(event.keyCode);
      input.justPressed.push(event.keyCode);
    }
  });
  
  //Upset donkey
  window.addEventListener('keyup',function(event){
    //Yes, it is the same code. Sorry, I'm too lazy to create a function right now.
    var keyboardIsDroppedIn=false;
    var keyboardInput;
    for(i=0;i<self.inputs.length;i++)
    {
      if(self.inputs[i].type=="keyboard")
      {
        keyboardIsDroppedIn=true;
        keyboardInput=i;
      }
    }
    //Let's do something different.
    var index;
    if(keyboardIsDroppedIn && (index=self.inputs[keyboardInput].pressed.indexOf(event.keyCode))>-1) //In case you released a key that you didn't hold
    {
      self.inputs[keyboardInput].pressed.splice(index,1); //How about no
    }
  });
  
  //Clicking, if you cannot understand my code. Wait, why are you reading then?
  this.holder.addEventListener('mousedown',function(){
    //Drop in system for mice too
    var mouseIsDroppedIn=false;
    var mouseInput=0;
    for(i=0;i<self.inputs.length;i++)
    {
      if(self.inputs[i].type=="mouse")
      {
        mouseIsDroppedIn=true;
        mouseInput=i;
      }
    }
    if(!mouseIsDroppedIn)
    {
      self.dropIn({
        "type":"mouse",
        "settings":[],
        "deviceName":"Mouse",
        "clicking":true,
        "justClciked":false,
        "lookAt":document.body
      })
    }
    else
    {
      self.inputs[mouseInput].clicking=true;
      self.inputs[mouseInput].justClicked=true;
    }
  });
  
  //Please figure out this one yourself
  this.holder.addEventListener('mouseup',function(){
    //Please
    var mouseIsDroppedIn=false;
    var mouseInput=0;
    for(i=0;i<self.inputs.length;i++)
    {
      if(self.inputs[i].type=="mouse")
      {
        mouseIsDroppedIn=true;
        mouseInput=i;
      }
    }
    //Ctrl+V is my favorite tool
    if(mouseIsDroppedIn)
    {
      self.inputs[mouseInput].clicking=false;
      self.inputs[mouseInput].justClicked=false;
    }
  });
  
  //Mouse Tracking System (Codename: C.A.T.)
  this.holder.addEventListener('mousemove',function(event){
    self.mouse=({
      "lookAt":event.toElement
    });
  });
  
  //Menu definitions. That will be long...
  this.menus={
    "layoutMenu":{ //This menu gives the player(s) the ability to choose their control mapping
      "name":"layout",
      "onChoose":function()
      {
        this.startGameMenu();
      },
      "elements":[
        {
          "type":"text",
          "selectable":false,
          "label":"Choose your layout",
          "fontSize":24,
          "pos":{"x":0,"y":-380}
        },
        {
          "type":"text",
          "selectable":false,
          "label":"If your numbered gamepad has a standard amount of joysticks, buttons, and triggers, choose HTML5 Standard",
          "fontSize":12,
          "pos":{"x":0,"y":-350}
        },
        {
          "type":"image",
          "selectable":true,
          "image":this.loadImage("engine/images/mapping_ps.png"),
          "label":"PlayStation",
          "pos":{"x":-360,"y":-240},
          "inputTypes":["gamepad"],
          "buttonToPress":"any",
          "action":"choose",
          "onChoose":function(element,player)
          {
            this.remap(player,[0,1,2,3],"ps");
          }
        },
        {
          "type":"image",
          "selectable":true,
          "image":this.loadImage("engine/images/mapping_standard.png"),
          "label":"HTML5 Standard",
          "pos":{"x":-120,"y":-240},
          "inputTypes":["gamepad"],
          "buttonToPress":"any",
          "action":"choose",
          "onChoose":function(element,player)
          {
            this.remap(player,[0,1,2,3],"html");
          }
        },
        {
          "type":"image",
          "selectable":true,
          "image":this.loadImage("engine/images/mapping_xb.png"),
          "label":"Letters",
          "pos":{"x":120,"y":-240},
          "inputTypes":["gamepad"],
          "buttonToPress":"any",
          "action":"choose",
          "onChoose":function(element,player)
          {
            this.remap(player,[0,1,2,3],"xb");
          }
        },
        {
          "type":"image",
          "selectable":true,
          "image":this.loadImage("engine/images/mapping_custom.png"),
          "label":"Custom",
          "pos":{"x":360,"y":-240},
          "inputTypes":["gamepad"],
          "buttonToPress":"any",
          "action":"choose",
          "onChoose":function(element,player)
          {
            this.remap(player,[0,1,2,3],"custom");
          }
        },
        {
          "type":"image",
          "selectable":true,
          "image":this.loadImage("engine/images/mapping_cw1.png"),
          "label":"Clockwise 1",
          "pos":{"x":-360,"y":0},
          "inputTypes":["gamepad"],
          "buttonToPress":"any",
          "action":"choose",
          "onChoose":function(element,player)
          {
            this.remap(player,[2,1,3,0],"cw1");
          }
        },
        {
          "type":"image",
          "selectable":true,
          "image":this.loadImage("engine/images/mapping_cw2.png"),
          "label":"Clockwise 2",
          "pos":{"x":-120,"y":0},
          "inputTypes":["gamepad"],
          "buttonToPress":"any",
          "action":"choose",
          "onChoose":function(element,player)
          {
            this.remap(player,[1,0,2,3],"cw2");
          }
        },
        {
          "type":"image",
          "selectable":true,
          "image":this.loadImage("engine/images/mapping_cw3.png"),
          "label":"Clockwise 3",
          "pos":{"x":120,"y":0},
          "inputTypes":["gamepad"],
          "buttonToPress":"any",
          "action":"choose",
          "onChoose":function(element,player)
          {
            this.remap(player,[0,3,1,2],"cw3");
          }
        },
        {
          "type":"image",
          "selectable":true,
          "image":this.loadImage("engine/images/mapping_cw4.png"),
          "label":"Clockwise 4",
          "pos":{"x":360,"y":0},
          "inputTypes":["gamepad"],
          "buttonToPress":"any",
          "action":"choose",
          "onChoose":function(element,player)
          {
            this.remap(player,[3,2,0,1],"cw4");
          }
        },
        {
          "type":"image",
          "selectable":true,
          "image":this.loadImage("engine/images/mapping_ccw1.png"),
          "label":"CCW 1",
          "pos":{"x":-360,"y":240},
          "inputTypes":["gamepad"],
          "buttonToPress":"any",
          "action":"choose",
          "onChoose":function(element,player)
          {
            this.remap(player,[2,3,1,0],"ccw1");
          }
        },
        {
          "type":"image",
          "selectable":true,
          "image":this.loadImage("engine/images/mapping_ccw2.png"),
          "label":"CCW 2",
          "pos":{"x":-120,"y":240},
          "inputTypes":["gamepad"],
          "buttonToPress":"any",
          "action":"choose",
          "onChoose":function(element,player)
          {
            this.remap(player,[1,2,0,3],"ccw2");
          }
        },
        {
          "type":"image",
          "selectable":true,
          "image":this.loadImage("engine/images/mapping_ccw3.png"),
          "label":"CCW 3",
          "pos":{"x":120,"y":240},
          "inputTypes":["gamepad"],
          "buttonToPress":"any",
          "action":"choose",
          "onChoose":function(element,player)
          {
            this.remap(player,[0,1,3,2],"ccw3");
          }
        },
        {
          "type":"image",
          "selectable":true,
          "image":this.loadImage("engine/images/mapping_ccw4.png"),
          "label":"CCW 4",
          "pos":{"x":360,"y":240},
          "inputTypes":["gamepad"],
          "buttonToPress":"any",
          "action":"choose",
          "onChoose":function(element,player)
          {
            this.remap(player,[3,0,2,1],"ccw4");
          }
        },
        {
          "type":"button",
          "selectable":true,
          "label":"Continue",
          "width":120,
          "pos":{"x":-240,"y":440},
          "inputTypes":["keyboard","mouse"],
          "buttonToPress":"any",
          "action":"choose",
          "onChoose":function(element,player)
          {
          }
        },
        {
          "type":"button",
          "selectable":true,
          "label":"Drop out",
          "width":120,
          "pos":{"x":240,"y":440},
          "buttonToPress":"any",
          "action":"press",
          "onPress":function(element,player)
          {
            this.dropOut(player);
          }
        }
      ]
    }
  };
  
  //Preload menu images
  /* Just kidding, that's already done up there
  for(var i in this.menus)
  {
    for(var j=0;j<this.menus[i].elements.length;j++)
    {
      if(this.menus[i].elements[j].type=="image")
      {
        this.loadImage(this.menus[i].elements[j].image);
      }
    }
  }
  */
  
  //Important thing, do not disturb the wizard
  this.indraw=false;
  
  //The grumpiest code in the project
  this.selectable=false;
  this.holder.addEventListener('selectstart',function(event){
    if(!self.selectable)
    {
      event.preventDefault();
    }
  });
  
  //Setup ticking
  this.interval=('interval' in input) ? input.interval : 15;
  setInterval(function()
  {
    self.tick.call(self);
  },this.interval);
  
  //Create initial menu
  this.initMenu(gamepadsEnabled);
  
  return this;
};

//No, create it now, don't let the publishers live
RomboEngine.prototype.initMenu=function(gamepadsEnabled)
{
  var initMenu=document.createElement('div');
  initMenu.innerHTML="Click or press any button on your selected input device<br><small>Keyboard"+(gamepadsEnabled ? ", mouse, and gamepads" : " and mouse")+" are supported</small>";
  initMenu.style.textAlign="center";
  this.applyMenu(initMenu,"init");
}

//Function to resize basically anything
RomboEngine.prototype.resizeCanvas=function(input)
{
  this.holder.style.width=this.holder.parentNode.offsetWidth+'px';
  this.holder.style.height=this.holder.parentNode.offsetHeight+'px';
  
  this.canvas.width=this.holder.offsetWidth;
  this.canvas.height=this.holder.offsetHeight;
  
  if(!input || !input.keepLeft)
  {
    this.menuholder.style.left=(this.canvas.width-this.menuholder.offsetWidth)/2+"px";
  }
  if(input && input.ignoreHeight)
  {
    this.menuholder.style.top=this.canvas.height/2+"px";
  }
  else
  {
    this.menuholder.style.top=(this.canvas.height-this.menuholder.offsetHeight)/2+"px";
  }
};

//Tick function. Because why not do something?
RomboEngine.prototype.tick=function()
{
  //This is the magical part. Do not touch.
  if(this.indraw)
  {
    return false;
  }
  this.indraw=true;
  
  this.rawGamepads=navigator.getGamepads();
  
  //Listen to the user, don't be a moron...
  //Noble. I wanted to say noble, not moron.
  this.listenInputs();
  
  //Check dropin AFTER they've been controlled to avoid spontaneous actions
  var gamepadsDroppedIn=this.checkDropInGamepads();
  
  //Do what the actual game wants to do
  if('gameTick' in this)
  {
    this.gameTick();
  }
  
  //And finally update the background
  if('backgroundController' in this)
  {
    this.backgroundController.tick();
  }
  
  //Oh, and draw it out. That's bit of necessary...
  this.draw.call(this);
  
  this.indraw=false;
  return true;
};

//For those who can't see the Matrix
RomboEngine.prototype.draw=function()
{
  //Clean up just to mess around again
  this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
  
  //Draw the background first. You know, that's why it's a background...
  if('backgroundController' in this)
  {
    this.backgroundController.draw();
  }
  
  //We will also need to draw the game itself. Those expectations...
  if('gameDraw' in this)
  {
    this.gameDraw();
  }
  
  //Don't worry about the HUD. That's DOM and the browser makes it for us.
  //You are not an intelligence dampening core to draw the HUD to the canvas.
};

//This function sets up the background controller
RomboEngine.prototype.setupBackground=function(backgroundController)
{
  this.backgroundController=new backgroundController({'gameController':this});
};

//Using menu system has never been as complicated as this one
RomboEngine.prototype.applyMenu=function(element,name)
{
  var self=this;
  
  if(this.menuholder.innerHTML=="")
  {
    this.revealMenu.call(this,element,name);
  }
  else
  {
    setTimeout(function(){self.revealMenu.call(self,element,name);},500);
    this.menuholder.style.opacity="0";
    this.resizeCanvas({'keepLeft':true,'ignoreHeight':true});
  }
};

//See?
RomboEngine.prototype.revealMenu=function(element,name)
{
  this.menuholder.innerHTML="";
  if(element)
  {
    this.menuholder.appendChild(element);
    this.menuholder.style.opacity="1";
    this.mode="menu";
    this.menu=name;
    this.resizeCanvas();
  }
};

//Finally something useful
RomboEngine.prototype.loadImage=function(src)
{
  var i=new Image();
  i.src=src;
  return i;
}

//Easy multiplayer is actually a bit hard to implement
//4 days later, still writing the menu - truer words have never been spoken
RomboEngine.prototype.checkDropInGamepads=function()
{
  var gamepads=this.rawGamepads;
  var count=0;
  for(var i=0;i<gamepads.length;i++)
  {
    if(gamepads[i])
    {
      var checkable=this.getCheckableGamepadByIndex(i);
      var gamepad=gamepads[i];
      if(!checkable)
      {
        checkable={
          "index":i,
          "timestamp":gamepad.timestamp
        };
        this.gamepads.push(checkable)
      }
      if(gamepad.timestamp>checkable.timestamp && !this.getInputGamepadByIndex.call(this,i))
      {
        count+=this.dropIn({
          "type":"gamepad",
          "index":i,
          "settings":[],
          "deviceName":gamepad.id.substring(0,gamepad.id.lastIndexOf("("))
        });
      }
    }
    else
    {
      var gamepad;
      if(gamepad=this.getInputGamepadByIndex(i))
      {
        this.dropOut(this.colors.indexOf(gamepad.color));
      }
    }
  }
  return count;
}

//Long name bullshit, because why not? Hope this would never happen at GNU...
RomboEngine.prototype.getCheckableGamepadByIndex=function(index)
{
  for(var i=0;i<this.gamepads.length;i++)
  {
    if(this.gamepads[i].index==index)
    {
      return this.gamepads[i];
    }
  }
  if(this.getGamepadByIndex(index))
  {
    return {"timestamp":0};
  }
  return false;
}

//Deja vu
RomboEngine.prototype.getGamepadByIndex=function(index)
{
  var gamepads=this.rawGamepads;
  for(var i=0;i<gamepads.length;i++)
  {
    if(gamepads[i] && gamepads[i].index==index)
    {
      return gamepads[i];
    }
  }
  return false;
}

//Seriously, I'm not even Neo, I feel this...
RomboEngine.prototype.getInputGamepadByIndex=function(index)
{
  for(var i=0;i<this.inputs.length;i++)
  {
    if(this.inputs[i].type=="gamepad" && this.inputs[i].index==index)
    {
      return this.inputs[i];
    }
  }
  return false;
}

//Local multiplayer up to the count of the colors that they can use. Original, isn't it?
RomboEngine.prototype.getInputColor=function()
{
  var availableColors=JSON.parse(JSON.stringify(this.colors));
  for(var i=0;i<this.inputs.length;i++)
  {
    var index;
    if((index=availableColors.indexOf(this.inputs[i].color))>-1)
    {
      availableColors.splice(index,1);
    }
  }
  return (availableColors.length) ? availableColors[0] : false;
}

//Drop in, drop out, don't throw it out.
RomboEngine.prototype.dropIn=function(currentInput)
{
  var color;
  if(color=this.getInputColor.call(this))
  {
    currentInput.color=color;
    currentInput.firstTick=true;
    this.inputs.push(currentInput);
    if(this.mode=="menu" && Array("init","dropin").indexOf(this.menu)>-1)
    {
      this.showDropinMenu();
    }
    else
    {
      var colorId=this.colors.indexOf(color);
      this.notify(currentInput.deviceName+" dropped in as "+this.colorSettings[colorId].name,colorId);
      if(this.isMenuCreated())
      {
        this.moveSelection(this.getFirstSelectableFor(this.activeMenu,colorId),colorId);
      }
    }
    return true;
  }
  return false;
}

//No comments for you with this one. Oh wait...
RomboEngine.prototype.dropOut=function(player)
{
  var input=this.getInputByPlayer(player);
  this.notify(input.deviceName+" dropped out from "+this.colorSettings[player].name,player);
  this.inputs.splice(this.inputs.indexOf(input),1);
  if(input.type=="gamepad")
  {
    var gamepad=this.getGamepadByIndex(input.index);
    var checkable=this.getCheckableGamepadByIndex(input.index)
    if(checkable.timestamp)
    {
      checkable.timestamp=gamepad ? gamepad.timestamp+1000 : 0;
    }
    else
    {
      this.gamepads.push({
        "index":input.index,
        "timestamp":gamepad.timestamp+1000
      });
    }
  }
  if(this.mode=="menu" && Array("init","dropin").indexOf(this.menu)>-1)
  {
    this.showDropinMenu();
  }
  else if(this.isMenuCreated())
  {
    this.deleteSelection(player);
  }
}

//Track who dropped in, because asking the NSA is mainstream
RomboEngine.prototype.showDropinMenu=function()
{
  var dropinMenu=document.createElement('div');
  var dropinHolder=document.createElement('div');
  dropinHolder.appendChild(dropinMenu);
  dropinMenu.style.display="inline-block";
  dropinMenu.style.textAlign="left";
  dropinHolder.style.textAlign="center";
  for(var i=0;i<this.inputs.length;i++)
  {
    var colorSettings=this.getSettingsOfColor(this.inputs[i].color);
    var thisLine=document.createElement('div');
    var name=document.createTextNode(this.inputs[i].deviceName);
    var starring=document.createTextNode("Player "+colorSettings.name+" is controlled by ");
    var image=colorSettings.image.cloneNode();
    image.style.marginTop="-32px";
    image.style.marginBottom="-32px";
    image.style.marginRight="16px";
    thisLine.style.marginTop="32px";
    thisLine.style.marginBottom="32px";
    thisLine.appendChild(image);
    thisLine.appendChild(starring);
    thisLine.appendChild(name);
    dropinMenu.appendChild(thisLine);
  }
  this.createMenu({
    "name":"dropin",
    "onChoose":function()
    {
      var isThereGamepad=false;
      for(var i=0;i<this.inputs.length;i++)
      {
        if(this.inputs[i].type=="gamepad")
        {
          isThereGamepad=true;
        }
      }
      if(isThereGamepad)
      {
        this.createMenu(this.menus.layoutMenu);
      }
      else
      {
        this.startGameMenu();
      }
    },
    "elements":[
      {
        "type":"dom",
        "pos":{"x":0,"y":-200},
        "node":dropinHolder
      },
      {
        "type":"button",
        "selectable":true,
        "label":"Continue",
        "width":120,
        "pos":{"x":-240,"y":200},
        "buttonToPress":"any",
        "action":"choose",
        "onChoose":function(element,player)
        {
        }
      },
      {
        "type":"button",
        "selectable":true,
        "label":"Drop out",
        "width":120,
        "pos":{"x":240,"y":200},
        "buttonToPress":"any",
        "action":"press",
        "onPress":function(element,player)
        {
          this.dropOut(player);
          if(!this.inputs.length)
          {
            this.initMenu();
          }
        }
      }
    ]
  });
}

//This name is really self docuenting
RomboEngine.prototype.getSettingsOfColor=function(color)
{
  return this.colorSettings[this.colors.indexOf(color)];
}

//Another menu function if you thought it was simple
RomboEngine.prototype.createMenu=function(menu)
{
  var menu=this.cloneObject(menu);
  var menuElement=document.createElement('div');
  for(var i=0;i<menu.elements.length;i++)
  {
    var element=menu.elements[i];
    var currentElement=document.createElement('div');
    currentElement.style.position="absolute";
    if(element.type=="image")
    {
      currentElement.classList.add("rombo-engine-menu-image");
      var image=element.image.cloneNode();
      image.style.display="block";
      currentElement.appendChild(image);
      currentElement.appendChild(document.createTextNode(element.label));
      if(element.selectable)
      {
        var selectbox=document.createElement("div");
        currentElement.appendChild(selectbox);
        element.selectbox=selectbox;
      }
      currentElement.style.left=(element.pos.x-image.width/2)+"px";
      currentElement.style.top=(element.pos.y-image.height/2)+"px";
    }
    else if(element.type=="button")
    {
      var label=document.createElement("div");
      label.classList.add("rombo-engine-menu-default");
      label.appendChild(document.createTextNode(element.label));
      label.style.float="left";
      label.style.width=element.width+"px";
      label.style.height=(element.height || 32)+"px";
      currentElement.appendChild(label);
      if(element.selectable)
      {
        var selectbox=document.createElement("div");
        selectbox.style.float="left";
        selectbox.style.marginTop="-8px";
        selectbox.style.marginBottom="-8px";
        selectbox.style.marginLeft="24px";
        selectbox.style.height="48px";
        currentElement.appendChild(selectbox);
        element.selectbox=selectbox;
      }
      currentElement.style.width=(element.width+(this.colors.length+1)*32)+"px";
      currentElement.style.left=(element.pos.x-element.width/2)+"px";
      currentElement.style.top=(element.pos.y-(element.height/2 || 16))+"px";
    }
    else if(element.type=="text")
    {
      currentElement.classList.add("rombo-engine-menu-text");
      currentElement.appendChild(document.createTextNode(element.label));
      currentElement.style.textAlign="center";
      currentElement.style.fontSize=(element.fontSize || 24)+"px";
      var width=this.canvas.width-(Math.abs(element.pos.x)*2);
      currentElement.style.width=width+"px";
      currentElement.style.left=(element.pos.x-width/2)+"px";
      currentElement.style.top=(element.pos.y)+"px";
    }
    else if(element.type=="dom")
    {
      currentElement.appendChild(element.node);
      var width=this.canvas.width-(Math.abs(element.pos.x)*2);
      currentElement.style.width=width+"px";
      currentElement.style.left=(element.pos.x-width/2)+"px";
      currentElement.style.top=(element.pos.y)+"px";
    }
    element.element=currentElement;
    menuElement.appendChild(currentElement);
  }
  
  menu.selections=[];
  
  var selections={};
  if(this.activeMenu && this.mode=="menu" && this.menu==menu.name)
  {
    for(var i=0;i<this.activeMenu.selections.length;i++)
    {
      var selection=this.activeMenu.selections[i];
      selections[selection.player]={
       "elementIndex":this.activeMenu.elements.indexOf(selection.selected),
       "checked":selection.checked
      }
    }
  }
  
  menuElement.style.height="32px";
  
  this.activeMenu=menu;
  this.applyMenu(menuElement,menu.name);
  
  for(var i=0;i<this.inputs.length;i++)
  {
    if(selections[this.colors.indexOf(this.inputs[i].color)])
    {
      var selection=selections[this.colors.indexOf(this.inputs[i].color)];
      this.moveSelection(this.activeMenu.elements[selection.elementIndex],this.colors.indexOf(this.inputs[i].color),selection.checked); //I should really write a utility function for that
    }
    else
    {
      this.moveSelection(this.getFirstSelectableFor(this.activeMenu,this.colors.indexOf(this.inputs[i].color)),this.colors.indexOf(this.inputs[i].color));
    }
  }
}

//Notification system as intermezzo
RomboEngine.prototype.notify=function(label,color)
{
  //var id='rombo_engine_notification_'+makeid(16); //In case of fire
  var notification=document.createElement('div');
  notification.classList.add("rombo-engine-notif-text");
  notification.style.borderWidth="0px";
  notification.style.height="0px";
  notification.style.fontSize="0px";
  notification.style.margin="0px";
  if(color!==undefined)
  {
    notification.style.borderImage="url('"+this.colorSettings[color].image.src+"') fill 32 stretch";
  }
  notification.appendChild(document.createTextNode(label));
  this.notifholder.appendChild(notification);
  this.showNotif(notification);
  this.disableNotif(notification);
  this.hideNotif(notification);
  //return notification; //Don't remove this line, there is black magic - seriously
  //I'm a f**kin' wizard
}

//No comments for you
//If you don't understand this code... well, that's called evolution
RomboEngine.prototype.showNotif=function(div)
{
  var notification=div;
  setTimeout(function(){
    notification.style.borderWidth="";
    notification.style.height="";
    notification.style.fontSize="";
    notification.style.margin="";
    notification.style.transition=".5s";
  },this.interval);
}

RomboEngine.prototype.disableNotif=function(div)
{
  var notification=div;
  setTimeout(function(){
    notification.style.opacity="0.3";
  },4000);
}

RomboEngine.prototype.hideNotif=function(div)
{
  var notification=div;
  var self=this;
  setTimeout(function(){
    notification.style.borderWidth="0px";
    notification.style.height="0px";
    notification.style.fontSize="0px";
    notification.style.margin="0px";
    self.removeNotif.call(self,notification);
  },8000);
}

RomboEngine.prototype.removeNotif=function(div)
{
  var notification=div;
  var self=this;
  setTimeout(function(){
    self.notifholder.removeChild(notification);
  },500);
}

//BAMM, utility code
//Project Universal Recursive Object Cloner With Self Documenting Name (UROCWSDN)
RomboEngine.prototype.cloneObject=function(object)
{
  if(object.__proto__==Object.prototype)
  {
    var newObject={};
    for(var i in object)
    {
      newObject[i]=this.cloneKey(object[i]);
    }
  }
  else if(object.__proto__==Array.prototype)
  {
    var newObject=[];
    for(var i=0;i<object.length;i++)
    {
      newObject[i]=this.cloneKey(object[i]);
    }
  }
  else
  {
    newObject=object;
  }
  return newObject;
}

//Project Universal Recursive Object Cloner With Self Documenting Name Object Recursion Detection Unit (UROCWSDN-ORDU)
RomboEngine.prototype.cloneKey=function(object)
{
  if(Array(Object.prototype,Array.prototype).indexOf(object.__proto__)>-1)
  {
    return this.cloneObject(object);
  }
  else
  {
    return object;
  }
}

//After my next few lines of code you will understand the intermezzo
RomboEngine.prototype.moveSelection=function(element,player,checked)
{
  var selection=this.getSelectionOf(player);
  
  var oldSelection=false;
  if(selection)
  {
    oldSelection=selection.selected;
    this.hideSelection(selection.element);
  }
  
  var selectionDiv=document.createElement('div');
  selectionDiv.classList.add( //Weird but working, I'm too lazy for a switch
    Array("","rombo-engine-menu-flatbar","rombo-engine-menu-seldot")
    [Array("image","button").indexOf(element.type)+1]
  );
  selectionDiv.style.borderImage="url('"+this.colorSettings[player].image.src+"') fill 32 stretch";
  selectionDiv.style.borderWidth="0px";
  selectionDiv.style.width="0px";
  selectionDiv.style.height="0px";
  selectionDiv.style.margin="0px";
  element.selectbox.appendChild(selectionDiv);
  this.showSelection(selectionDiv,checked);
  
  if(!selection)
  {
    this.activeMenu.selections.push({
      "player":player,
      "element":selectionDiv,
      "selected":element,
      "checked":checked || false
    });
  }
  else
  {
    selection.selected=element;
    selection.element=selectionDiv;
    selection.checked=checked || false;
  }
  
  element.element.classList.add('rombo-engine-menu-active'); //Elemenception
  if(oldSelection && !this.getSelectionsOfElement(oldSelection).length)
  {
    oldSelection.element.classList.remove('rombo-engine-menu-active');
  }
}

//See?
RomboEngine.prototype.showSelection=function(div,shouldCheck)
{
  var element=div;
  var checked=shouldCheck;
  setTimeout(function(){
    element.style.borderWidth="";
    element.style.width="";
    element.style.height="";
    element.style.transition="0.5s";
    if(checked)
    {
      element.style.marginTop="8px";
      element.style.opacity="0.5";
    }
  },this.interval);
}

//Yeah, that's pretty much paralell. Please offer a way to unite those.
RomboEngine.prototype.hideSelection=function(div)
{
  var self=this;
  var element=div;
  setTimeout(function(){
    element.style.borderWidth="0px";
    element.style.width="0px";
    element.style.height="0px";
    self.removeSelection.call(self,element);
  });
}

RomboEngine.prototype.removeSelection=function(div)
{
  var element=div;
  setTimeout(function(){
    element.parentNode.removeChild(element);
  },500);
}

//Did you realize that there were actually no comments for you in the previous function? I WON! Finally...
RomboEngine.prototype.deleteSelection=function(player)
{
  var selection=this.getSelectionOf(player);
  this.hideSelection(selection.element);
  this.activeMenu.selections.splice(this.activeMenu.selections.indexOf(selection),1); //var statements are too mainstream
  if(!this.getSelectionsOfElement(selection.selected).length)
  {
    selection.selected.element.classList.remove('rombo-engine-menu-active'); //Four dots in a function name. Today's record.
  }
}

//Two handy utility functions with usual content
RomboEngine.prototype.getSelectionOf=function(player)
{
  for(var i=0;i<this.activeMenu.selections.length;i++)
  {
    var selection=this.activeMenu.selections[i];
    if(selection.player==player)
    {
      return selection;
    }
  }
  return false;
}

RomboEngine.prototype.getFirstSelectable=function(menu)
{
  for(var i=0;i<menu.elements.length;i++)
  {
    var element=menu.elements[i];
    if(element.selectable)
    {
      return element;
    }
  }
  return false;
}

//I mean three
RomboEngine.prototype.getFirstSelectableFor=function(menu,player)
{
  for(var i=0;i<menu.elements.length;i++)
  {
    var element=menu.elements[i];
    if(this.isSelectableFor(element,player))
    {
      return element;
    }
  }
  return false;
}

//And another
RomboEngine.prototype.getInputByPlayer=function(id)
{
  for(var i=0;i<this.inputs.length;i++)
  {
    var input=this.inputs[i];
    if(this.colors.indexOf(input.color)==id)
    {
      return input;
    }
  }
  return false;
}

//Creativity is important
RomboEngine.prototype.getSelectionsOfElement=function(element)
{
  var result=[];
  for(var i=0;i<this.activeMenu.selections.length;i++)
  {
    var selection=this.activeMenu.selections[i];
    if(selection.selected==element)
    {
      result.push(selection);
    }
  }
  return result;
}

//Do something important finally
RomboEngine.prototype.stepSelection=function(player,dir)
{
  //Tomorrow
  
  //There was a real one-day gap cutted out. Anyway, back to coding.
  
  //0-up, 1-down, 2-left, 3-right //Wow. That was actually helpful. Maybe I'll delete it someday.
  var selection=game.getSelectionOf(player);
  var pos=selection.selected.pos;
  var minDistance=Infinity;
  var secondaryMinDistance=Infinity;
  var nextSelected=selection.selected;
  
  for(var i=0;i<this.activeMenu.elements.length;i++)
  {
    //console.log("Still alive"); //You are in space
    var element=this.activeMenu.elements[i];
    var epos=element.pos;
    var rule1=pos.x+pos.y>epos.x+epos.y;
    var rule2=pos.x-pos.y>epos.x-epos.y;
    var xd=Math.abs(pos.x-epos.x);
    var yd=Math.abs(pos.y-epos.y);
    var rulex=xd<minDistance || (xd==minDistance && yd<secondaryMinDistance);
    var ruley=yd<minDistance || (yd==minDistance && xd<secondaryMinDistance);
    var d=Infinity;
    var d2=Infinity;
    var result=false;
    switch(dir)
    {
      case 0:
        result=(rule1)&&(!rule2)&&(ruley);
        d=yd;
        d2=xd;
      break;
      case 1:
        result=(!rule1)&&(rule2)&&(ruley);
        d=yd;
        d2=xd;
      break;
      case 2:
        result=(rule1)&&(rule2)&&(rulex);
        d=xd;
        d2=yd;
      break;
      case 3:
        result=(!rule1)&&(!rule2)&&(rulex);
        d=xd;
        d2=yd;
      break;
    }
    if(result && element!=selection.selected && this.isSelectableFor(element,player))
    {
      nextSelected=element;
      minDistance=d;
      secondaryMinDistance=d2;
    }
  }
  this.moveSelection(nextSelected,player);
}

//Just kidding, another utility function
RomboEngine.prototype.isMenuCreated=function()
{
  return (this.mode=="menu" && this.activeMenu && this.menu==this.activeMenu.name);
}

//Scrizophenic code listens to itself
RomboEngine.prototype.listenInputs=function()
{
  for(var i=0;i<this.inputs.length;i++)
  {
    var input=this.inputs[i];
    var player=this.colors.indexOf(input.color);
    if(input.type=="mouse") //Mouse control, no sh*t Sherlock
    {
      if(this.isMenuCreated())
      {
        var element=this.searchMenuElement(this.mouse.lookAt);
        if(element && this.isSelectableFor(element,player))
        {
          if(element!=this.getSelectionOf(player).selected)
          {
            this.moveSelection(element,player);
          }
          if(input.justClicked)
          {
            this.fireAction(this.getSelectionOf(player),player);
          }
        }
      }
      input.justClicked=false;
    }
    else if(input.type=="gamepad")
    {
      var gamepad=this.getGamepadByIndex(input.index);
      if(!gamepad)
      {
        continue;
      }
      if(!("pressed" in input))
      {
        input.pressed=[];
      }
      input.justPressed=[];
      for(var j=0;j<gamepad.buttons.length;j++)
      {
        if(gamepad.buttons[j].pressed && input.pressed.indexOf(j)==-1)
        {
          input.pressed.push(j);
          input.justPressed.push(j);
          //console.log("Pressed "+j+" on "+input.deviceName) //For research purposes
        }
        else if(!gamepad.buttons[j].pressed && input.pressed.indexOf(j)!=-1)
        {
          var a=input.pressed.splice(input.pressed.indexOf(j),1);
        }
      }
      
      if(input.firstTick)
      {
        input.justPressed=[];
      }
      
      if(this.isMenuCreated())
      {
        //D-pad handling
        for(var j=0;j<4;j++) //That was variable i once. It took me an entire day to find out that. True story... sadly
        {
          if(input.justPressed.indexOf(j+12)>-1)
          {
            this.stepSelection(player,j);
          }
        }
        
        //Control menu with left stick
        if(!("menumove" in input))
        {
          input.menumove={"x":0,"y":0,"dirs":[false,false,false,false],"px":0,"py":0};
        }
        var prevmove=this.cloneObject(input.menumove);
        var x=gamepad.axes[0]-input.menumove.px;
        var y=gamepad.axes[1]-input.menumove.py;
        
        if(x>0 && gamepad.axes[0]>0)
        {
          input.menumove.x+=x;
          input.menumove.dirs[3]=true;
        }
        else
        {
          input.menumove.dirs[3]=false;
        }
        
        if(x<0 && gamepad.axes[0]<0)
        {
          input.menumove.x-=x;
          input.menumove.dirs[2]=true;
        }
        else
        {
          input.menumove.dirs[2]=false;
        }
        
        if(y>0 && gamepad.axes[1]>0)
        {
          input.menumove.y+=y;
          input.menumove.dirs[1]=true;
        }
        else
        {
          input.menumove.dirs[1]=false;
        }
        
        if(y<0 && gamepad.axes[1]<0)
        {
          input.menumove.y-=y;
          input.menumove.dirs[0]=true;
        }
        else
        {
          input.menumove.dirs[0]=false;
        }
        
        input.menumove.px=gamepad.axes[0];
        input.menumove.py=gamepad.axes[1];
        
        for(var j=0;j<4;j++)
        {
          var dir=(j<2) ? "y" : "x";
          var opp=(j%2) ? j-1 : j+1;
          if(!input.menumove.dirs[j] && prevmove.dirs[j])
          {
            if(input.menumove[dir]>0.5 && !input.firstTick)
            {
              this.stepSelection(player,j);
            }
            input.menumove[dir]=0;
          }
        }
        
        //Control menu with right stick too
        //Just kidding, I'm not THAT insane
        
        //Remap buttons
        if(!input.remap)
        {
          input.remap=[0,1,2,3];
        }
        
        //Handle button press in menu
        var rawSelection=this.getSelectionOf(player);
        var selection=rawSelection.selected;
        if(selection)
        {
          var selectionButton=selection.buttonToPress || 0;
          if(((selectionButton=="any" && this.isFaceButtonJustPressed(input)) || input.justPressed.indexOf(input.remap[selectionButton])>-1))
          {
            this.fireAction(rawSelection,player);
          }
        }
      }
    }
    else if(input.type=="keyboard")
    {
      if(input.justPressed.indexOf(38)>-1) //Up
      {
        this.stepSelection(player,0);
      }
      if(input.justPressed.indexOf(40)>-1) //Down
      {
        this.stepSelection(player,1);
      }
      if(input.justPressed.indexOf(37)>-1) //Left
      {
        this.stepSelection(player,2);
      }
      if(input.justPressed.indexOf(39)>-1) //Right
      {
        this.stepSelection(player,3);
      }
      
      if(this.isMenuCreated() && input.justPressed.indexOf(13)>-1) //Towards the screen
      {
        var selection=this.getSelectionOf(player);
        this.fireAction(selection,player);
      }
      
      input.justPressed=[];
    }
    
    input.firstTick=false;
  }
}

//Utility functions are still important
RomboEngine.prototype.isFaceButtonJustPressed=function(input)
{
  var pressed=false;
  for(var i=0;i<4;i++)
  {
    if(input.justPressed.indexOf(i)>-1)
    {
      pressed=true;
    }
  }
  return pressed;
}

//So I'll write one more there
RomboEngine.prototype.fireAction=function(selection,player) //Set them on fire
{
  var element=selection.selected;
  if(element.onPress && element.action=="press")
  {
    element.onPress.call(this,element,player);
  }
  else if(element.onChoose && element.action=="choose")
  {
    selection.checked=!selection.checked;
    if(selection.checked)
    {
      selection.element.style.marginTop="8px";
      selection.element.style.opacity="0.5";
    }
    else
    {
      selection.element.style.marginTop="";
      selection.element.style.opacity="";
    }
    this.isNeoReady();
  }
}

//Deep search in a desert tree. Even deeper than Jaden.
RomboEngine.prototype.searchMenuElement=function(currentElement)
{
  for(var i=0;i<this.activeMenu.elements.length;i++)
  {
    var element=this.activeMenu.elements[i];
    if(currentElement==element.element)
    {
      return element;
    }
  }
  if(currentElement && currentElement.parentNode!=document.body)
  {
    return this.searchMenuElement(currentElement.parentNode);
  }
  return false; //I don't like else
}

//Okay, now we can remap player controls
RomboEngine.prototype.remap=function(player,map,mapname)
{
  var input=this.getInputByPlayer(player);
  input.remap=map;
  input.mapname=mapname; //So much useful code...
}

//Or check if everybody chose his/her (note the hope there) path and continue
RomboEngine.prototype.isNeoReady=function()
{
  var inevitable=true; //Agent Smith detected
  var choices=[]; //You already made them
  for(var i=0;i<this.activeMenu.selections.length;i++)
  {
    if(!this.activeMenu.selections[i].checked)
    {
      inevitable=false;
    }
    else
    {
      choices.push(this.activeMenu.selections[i].selected);
    }
  }
  if(inevitable) //How can this be a question?
  {
    for(var i=0;i<this.inputs.length;i++)
    {
      var input=this.inputs[i];
      var player=this.colors.indexOf(input.color);
      var selection=this.getSelectionOf(player);
      if(selection.selected.onChoose) //Maybe onChosenOne instead
      {
        selection.selected.onChoose.call(this,selection.selected,player);
      }
    }
    if(this.activeMenu.onChoose)
    {
      this.activeMenu.onChoose.call(this,choices);
    }
    else
    {
      //neo.kill(); //It was inevitable
    }
  }
  return inevitable;
}

//There was too much code that actually does something. Let me write a utility function.
RomboEngine.prototype.isSelectableFor=function(element,player)
{
  var input=game.getInputByPlayer(player);
  var selectable=element.selectable;
  if(element.inputTypes && element.inputTypes.indexOf(input.type)==-1)
  {
    selectable=false;
  }
  if(element.whitelist && element.whitelist.indexOf(player)==-1)
  {
    selectable=false;
  }
  if(element.blacklist && element.blacklist.indexOf(player)>-1)
  {
    selectable=false;
  }
  return selectable;
}

//And it's time to do something with the game
RomboEngine.prototype.startGameMenu=function()
{
  if('gameMenu' in this)
  {
    this.gameMenu();
  }
  else
  {
    this.createMenu({
      "name":"game404",
      "onChoose":function()
      {
        this.showDropinMenu();
      },
      "elements":[
        {
          "type":"text",
          "label":"Error 404",
          "fontSize":64,
          "pos":{"x":0,"y":-96},
          "selectable":false
        },
        {
          "type":"text",
          "label":"Game not found",
          "fontSize":32,
          "pos":{"x":0,"y":-16},
          "selectable":false
        },
        {
          "type":"text",
          "label":"You can go back, assign your controls again, and hope it will change. It won't.",
          "fontSize":16,
          "pos":{"x":0,"y":32},
          "selectable":false
        },
        {
          "type":"button",
          "selectable":true,
          "label":"Okay, let's do that",
          "width":240,
          "pos":{"x":-320,"y":96},
          "buttonToPress":"any",
          "action":"choose",
          "onChoose":function()
          {
          }
        },
        {
          "type":"button",
          "selectable":true,
          "label":"I'm not a moron",
          "width":240,
          "pos":{"x":320,"y":96},
          "buttonToPress":"any",
          "action":"choose",
          "onChoose":function()
          {
          }
        }
      ]
    });
  }
}

//External code snipetts starts here
//Special thanks to everyone who wrote them

//Fullscreen code by Zuul from Stack Overflow
function toggleFullScreen()
{
  if ((document.fullScreenElement && document.fullScreenElement !== null) ||    // alternative standard method (Zuul)
      (!document.mozFullScreen && !document.webkitIsFullScreen)) {               // current working methods (Zuul)
    if (document.documentElement.requestFullScreen) {
      document.documentElement.requestFullScreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullScreen) {
      document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
  }
}

//Sorry, I forgot your name. Thank you, random Stack Overflow user for this useful ID generator...  //...that I never used
function makeid(len)
{
	  var text = "";
	  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	  for( var i=0; i < len; i++ )
	      text += possible.charAt(Math.floor(Math.random() * possible.length));

	  return text;
}

//Why am I commenting this? I have a little bit too much freetime...
