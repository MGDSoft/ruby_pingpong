
//var socket = io.connect('http://mgdsoftware.es:6969');
var socket;

function connectNode()
{

    var sala= new Sala();

    socket = io.connect('http://mgdsoftware.es:6969');
    socket.on('connect_failed', function(){
        alert('Servidor nodeJs no iniciado :(');
    });
    socket.on('error', function(){
        alert('Servidor nodeJs no iniciado :(');
    });
    socket.on('connect', function(){
        sala.nuevo_jugador(socket);
    });
    socket.on('nuevo_jugador', function(){
        sala.nuevo_jugador(socket);
    });
    socket.on('mensaje', function(data) {
        sala.mensaje(data);
    });
    socket.on('asignar_jugador', function(jugador1,jugador2) {
        sala.asignar_jugador(jugador1,jugador2);
    });
    socket.on('asignar_oponente', function(opo) {
        sala.asignar_oponente(opo);
    });
    socket.on('iniciar_juego', function() {
        sala.iniciar_juego(socket);
    });
    socket.on('sala_llena', function() {
        sala.iniciar_juego();
    });
    socket.on('esperando_otro_jugador_ready', function() {
        sala.esperando_otro_jugador_ready();
    });
    socket.on('empezar_juego', function() {
        sala.empezar_juego();
    });
    socket.on('movimiento_jugador', function(direccion,estado){
        sala.movimiento_jugador(direccion,estado);
    });
    socket.on('colision_pala', function(pelota_movimiento_y,pelota_x,pelota_y,pelota_direccion,pelota_movimiento_x){
        sala.colision_pala(pelota_movimiento_y,pelota_x,pelota_y,pelota_direccion,pelota_movimiento_x);
    });
    socket.on('gool', function(score1,score2){
        sala.gool(score1,score2);
    });
    socket.on('desconexion_oponente', function(score1,score2){
        sala.desconexion_oponente();
    });
    socket.on('pausa', function(){
        sala.pausa();
    });
    socket.on('despausar', function(){
        sala.despausar();
    });
    socket.on('mensaje_chat', function(msg){
        console.log('respuesta'+msg);
        var textarea=document.getElementById("mensajes");
        textarea.innerHTML+="\n "+msg;
        textarea.scrollTop = textarea.scrollHeight;
    });

    document.getElementById("mensaje").addEventListener('keydown',function(evt){sala.mensaje_key(evt);},false);
}

var jugador1_nombre = null,jugador2_nombre=null;




