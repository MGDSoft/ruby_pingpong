function startGameOnline(){
    startCommon();
    connectNode();
    document.getElementById("chat").className = "row";
}
function startGameLan(){
    startCommon();
    var pingPong = new PingPong_MGD('canvas');
    pingPong.start(false);
}
function startCommon()
{
    document.getElementById("pala-left").remove();
    document.getElementById("pala-right").remove();
    document.getElementById("presentacion").innerHTML='<canvas id="canvas"></canvas>';
}