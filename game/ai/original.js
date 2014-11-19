// RomboFight Reloaded AI system
// Original version, based on the AI of RomboFight 2
// (cc) Licensed under Creative Commons CC-BY-NC by Three Universe Studios 2014

onmessage=function(event) {
  var data=event.data;
  var response={
    "controls":data.controls,
    "type":"control"
  }
  
  //Shoot up everything just to make sure it works
  for(var i in data.controls)
  {
    response.controls[i].primary=true;
  }
  
  postMessage(response);
}
