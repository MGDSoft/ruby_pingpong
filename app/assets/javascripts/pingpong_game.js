/*
 * JUEGO CREADO POR MGDSOFTWARE PARA PROBAR LA POTENCIA DE CANVAS Y WEBSOCKET
 * SU USO ESTA PERMITIDO PARA EL APRENDIZAJE DE ESTOS PERO NO SERA PERMITIDO
 * LUCRARSE CON SU USO.
 *
 * http://www.mgdsoftware.es   DESARROLLOS WEB
 */

function PingPong_MGD (canvasId){
    this.canvas= document.getElementById(canvasId);
    var self = this;

    // Variables exclusivas para el juego online
    var juegoOnline=false,in_jugador1=true,in_jugador2=true,nombre_usuario='',nombre_oponente='',sala='',esperando_peticion=false,despausable=false;

    var lastKey=null,context=null;

    // tiempo en el que se realiza la peticiendo para que calcule las posiciones
    var TIEMPO_REFRESCO=40,TIEMPO_REFRESCO_MOVIMIENTO=20;

    var ESTADO_ON="on", ESTADO_PENDIENTE="pendiente", ESTADO_PAUSA="pausa", ESTADO_INICIO="inicio",estado=ESTADO_INICIO;

    var POS_GOL=10;
    var POS_X_JUGADOR=POS_GOL + 30;

    var PALA_HEIGHT=40, PALA_WIDTH=5;
    var POS_SCORE_X=150,POS_SCORE_Y=120,POS_NOMBRE_USU=POS_SCORE_Y+100;

    var MOVIMIENTO_JUGADOR_Y=10;

    var KEYS_CODES = {
        'PAUSE' : 80,

        'UP_1_JUG_1' : 81,
        'UP_2_JUG_1' : 87,
        'DOWN_1_JUG_1' : 83,
        'DOWN_2_JUG_1' : 65,


        'UP_1_JUG_2' : 37,
        'UP_2_JUG_2' : 38,
        'DOWN_JUG_2' : 39,
        'DOWN_2_JUG_2' : 40
    }

    init();

    // VARS PELOTA
    var PELOTA_TAMANO=13;
    var PELOTA_MOVIMIENTO_SUMA=2,PELOTA_MOVIMIENTO_INICIO=5,pelota_movimiento_x,PELOTA_MOVIMIENTO_MAX=15,pelota_movimiento_y;
    var PELOTA_DIR_DER=true,PELOTA_DIR_IZQ=false;
    var PELOTA_IMG=new Image();
    PELOTA_IMG.src='images/Soccer_16x16.png';

    var GOL_AUDIO=new Audio(),GOLPE_AUDIO=new Audio();
    GOL_AUDIO.src='media/gol.mp3';
    GOLPE_AUDIO.src='media/golpe.mp3';

    var pelota_x,pelota_y,pelota_direccion;

    var jugador1_y, jugador2_y;
    var score1=0, score2=0;

    var jugador1_subiendo=false, jugador1_bajando=false,jugador2_subiendo=false, jugador2_bajando=false;


    this.configuracion_online=function(socke,in_juga1,in_juga2,nombre_usu,nombre_opo,sal){

        juegoOnline=true;
        socket=socke;
        in_jugador1=in_juga1;
        in_jugador2=in_juga2;
        nombre_usuario=nombre_usu;
        nombre_oponente=nombre_opo;
        sala=sal;
        debug('Jugador '+(in_juga1 ? '1': '2'))
    }
    this.start=function(juegoOnline){
        this.juegoOnline = juegoOnline;
        main_game();
    }
    function reiniciar_valores(){

        pelota_movimiento_x=PELOTA_MOVIMIENTO_INICIO;
        pelota_movimiento_y=0;
        pelota_x=canvas.width/2;
        pelota_y=canvas.height/2;
        pelota_direccion=PELOTA_DIR_IZQ;
        jugador1_y=canvas.height/2;
        jugador2_y=jugador1_y;
        esperando_peticion=false;

    }
    function debug(obj){
        //console.log('ping-pong: '+obj);
    }
    function limpia_canvas(){
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function main_game(){
        debug('INICIO JUEGO');

        self.cambio_estado(LANG.pulsa_tecla_para_empezar);
        ejecucion();
    }
    function ejecucion(){
        //debug('ejecucion '+estado);
        if (estado == ESTADO_INICIO)
            ejecucion_estado_inicio();
        else if (estado == ESTADO_PAUSA)
            ejecucion_estado_pausa();
        else if (estado == ESTADO_ON)
            ejecucion_estado_on();

        //setTimeout(ejecucion, TIEMPO_REFRESCO); // 40 - 25fps
        requestAnimFrame(ejecucion,TIEMPO_REFRESCO);
    }
    function ejecucion_estado_inicio(){
        if (lastKey != null)
        {
            debug('estado actual: '+estado+" "+ESTADO_INICIO+" "+juegoOnline+" ");

            if (juegoOnline==true && estado==ESTADO_INICIO)
            {
                socket.emit('estado_preparado',nombre_usuario);
                estado=ESTADO_PENDIENTE;

            }else if (juegoOnline==true && estado==ESTADO_PENDIENTE){
                // esperando al oponente a que verifique que esta disponible
            }else{
                self.set_cambio_estado_on();
            }
        }
    }
    function pintar_mapa(){
        //debug('pintar_mapa ');
        canvas.style.borderTop = '1px solid #CADCEB';
        canvas.style.borderBottom = '1px solid #CADCEB';

        context.beginPath();

        context.strokeStyle = "#CADCEB";
        context.moveTo(canvas.width/2,0);
        context.lineTo(canvas.width/2,canvas.height);
        context.stroke();

        pintar_score();

        context.closePath();

        context.dashedLine(POS_GOL,0,POS_GOL,canvas.height,15,"#404040");
        context.dashedLine(canvas.width-POS_GOL,0,canvas.width-POS_GOL,canvas.height,15,"#404040");

    }
    function pintar_nombre_usuario(){
        if (juegoOnline)
        {
            context.font = 'bold 50px Calibri';
            if (in_jugador1)
            {
                context.fillText(nombre_usuario, (canvas.width/2) - POS_SCORE_X, POS_NOMBRE_USU);
                context.fillText(nombre_oponente, (canvas.width/2) + POS_SCORE_X, POS_NOMBRE_USU);
            }else{
                context.fillText(nombre_oponente, (canvas.width/2) - POS_SCORE_X, POS_NOMBRE_USU);
                context.fillText(nombre_usuario, (canvas.width/2) + POS_SCORE_X, POS_NOMBRE_USU);
            }
        }
    }
    function pintar_score(){

        context.fillStyle = '#5C5C5C';
        context.font = 'bold 100px sans-serif';
        context.fillText(score1, (canvas.width/2) - POS_SCORE_X, POS_SCORE_Y);
        context.fillText(score2, (canvas.width/2) + POS_SCORE_X, POS_SCORE_Y);

        pintar_nombre_usuario();

    }
    function pintar_pelota(){
        context.drawImage(PELOTA_IMG,pelota_x,pelota_y);
    }
    function pintar_jugadores(){
        //debug('pintar_jugadores ');

        context.beginPath();

        context.strokeStyle = "#436B8C";
        context.lineWidth = PALA_WIDTH;
        context.moveTo(POS_X_JUGADOR,jugador1_y-PALA_HEIGHT);
        context.lineTo(POS_X_JUGADOR,jugador1_y+PALA_HEIGHT);
        context.stroke();

        context.moveTo(canvas.width-POS_X_JUGADOR,jugador2_y-PALA_HEIGHT);
        context.lineTo(canvas.width-POS_X_JUGADOR,jugador2_y+PALA_HEIGHT);
        context.stroke();

        context.closePath();

    }
    function ejecucion_estado_pausa(){

    }
    function ejecucion_estado_on(){
        limpia_canvas();
        pintar_mapa();
        pintar_jugadores();
        pintar_pelota();
        busca_colision_palas();
        busca_colision_pared();
        movimiento_pelota();
        busca_gol();
    }
    function busca_gol(){
        var gol=false;

        if (pelota_x <= 0)
        {


            if (juegoOnline==false)
            {
                gol=true;
                ++score2;
            }

            if (juegoOnline && in_jugador1 && esperando_peticion==false)
            {
                socket.emit('gool',score1,++score2);
                esperando_peticion=true;
            }

        }else if (pelota_x >= canvas.width){


            if (juegoOnline==false)
            {
                gol=true;
                ++score1;
            }

            if (juegoOnline && in_jugador2 && esperando_peticion==false)
            {
                socket.emit('gool',++score1,score2);
                esperando_peticion=true;
            }

        }

        if (gol && juegoOnline == false)
        {
            self.gool(score1,score2);
        }
    }


    function busca_colision_pared(){

        if (pelota_movimiento_y >0 && (pelota_y + pelota_movimiento_y >= canvas.height))
        {
            colision_pared();
        }else if (pelota_movimiento_y < 0  && (pelota_y + pelota_movimiento_y <= 0)){

            colision_pared();
        }
    }
    function colision_pared(){
        pelota_movimiento_y=-(pelota_movimiento_y);
        GOLPE_AUDIO.play();
        debug('choque con la pared');
    }
    function busca_colision_palas(){
        if (pelota_direccion == PELOTA_DIR_DER)
        {

            if ((pelota_x == canvas.width-POS_X_JUGADOR-PELOTA_TAMANO || (pelota_x + pelota_movimiento_x > canvas.width-POS_X_JUGADOR-PELOTA_TAMANO && pelota_x < canvas.width-POS_X_JUGADOR-PELOTA_TAMANO)) && // posicion x de colision
                pelota_y+PELOTA_TAMANO > jugador2_y - PALA_HEIGHT && pelota_y < jugador2_y + PALA_HEIGHT) // verificacion que el jugador esta en colision en y
            {
                if ((juegoOnline && in_jugador2) || juegoOnline==false)
                {
                    colision(jugador2_y);
                }
            }

        }else{

            if ((pelota_x == POS_X_JUGADOR+PELOTA_TAMANO || (pelota_x + pelota_movimiento_x > POS_X_JUGADOR+PELOTA_TAMANO && pelota_x < POS_X_JUGADOR+PELOTA_TAMANO)) && // posicion x de colision
                pelota_y+PELOTA_TAMANO > (jugador1_y - PALA_HEIGHT) && pelota_y < (jugador1_y + PALA_HEIGHT)) // verificacion que el jugador esta en colision en y
            {
                if ((juegoOnline && in_jugador1) || juegoOnline==false)
                {
                    colision(jugador1_y);
                }
            }
        }
    }
    function colision(altura_jugador){

        pelota_movimiento_y=(pelota_y-altura_jugador)/3;

        if (pelota_movimiento_x < PELOTA_MOVIMIENTO_MAX)
            pelota_movimiento_x+=PELOTA_MOVIMIENTO_SUMA;

        // Referente al tema de las X
        if (pelota_direccion == PELOTA_DIR_IZQ)
        {
            if (juegoOnline ==false)
                pelota_direccion = PELOTA_DIR_DER;

            if (juegoOnline && in_jugador1)
            {
                pelota_direccion = PELOTA_DIR_DER;
                socket.emit('colision_pala',pelota_movimiento_y,pelota_x,pelota_y,pelota_direccion,pelota_movimiento_x);
            }

        }else{
            if (juegoOnline==false)
                pelota_direccion = PELOTA_DIR_IZQ;

            if (juegoOnline && in_jugador2)
            {
                pelota_direccion = PELOTA_DIR_IZQ;
                socket.emit('colision_pala',pelota_movimiento_y,pelota_x,pelota_y,pelota_direccion,pelota_movimiento_x);
            }
        }



        // Tema de las y

        GOLPE_AUDIO.play();
        debug("colision con la pala de un usuario!");
    }
    function movimiento_pelota(){

        if (pelota_direccion == PELOTA_DIR_DER)
        {
            pelota_x+=pelota_movimiento_x;
        }else{
            pelota_x-=pelota_movimiento_x;
        }

        pelota_y+=pelota_movimiento_y;
    }
    function init(){
        canvas=document.getElementById('canvas');
        canvas.width  = 1000;
        canvas.height = 600;
        context=canvas.getContext('2d');

        // Listener para saber la tecla que se pulsa
        document.addEventListener('keydown',function(evt){ key_down(evt.keyCode);},false);
        document.addEventListener('keyup',function(evt){ key_up(evt.keyCode);},false);
        document.addEventListener('click',function(evt){ click(evt);},false);

    }
    function click(event) {
        /*

        Desactivado xq es muy inexacto

        event = event || window.event;

        var canvas = document.getElementById('canvas'),
            x = event.pageX - canvas.offsetLeft,
            y = event.pageY - canvas.offsetTop;

        debug("evento click "+ y);

        if (!juegoOnline)
        {
            var canvasMid=canvas.width/2;

            if (jugador2_subiendo || jugador1_subiendo || jugador2_bajando || jugador1_bajando)
            {
                key_up(KEYS_CODES.UP_1_JUG_1);
                key_up(KEYS_CODES.DOWN_1_JUG_1);
                debug("se para");
            }else{
                if (canvasMid>y)
                {
                    key_down(KEYS_CODES.UP_1_JUG_1);
                    debug("subiendo");
                }else{
                    debug("bajando");
                    key_down(KEYS_CODES.DOWN_1_JUG_1);
                }
            }

        }*/
    }

    function movimiento_jugadores(){

        if (jugador1_subiendo && (jugador1_y-PALA_HEIGHT) > 0)
            jugador1_y-=MOVIMIENTO_JUGADOR_Y;

        if (jugador1_bajando && (jugador1_y+PALA_HEIGHT) < canvas.height)
            jugador1_y+=MOVIMIENTO_JUGADOR_Y;

        if (jugador2_subiendo && (jugador2_y-PALA_HEIGHT) > 0)
            jugador2_y-=MOVIMIENTO_JUGADOR_Y;

        if (jugador2_bajando  && (jugador2_y+PALA_HEIGHT) < canvas.height)
            jugador2_y+=MOVIMIENTO_JUGADOR_Y;

        requestAnimFrame(movimiento_jugadores,TIEMPO_REFRESCO_MOVIMIENTO);
        //setTimeout(movimiento_jugadores, TIEMPO_REFRESCO_MOVIMIENTO);
    }

    function key_up(keyCode){
        debug ("detectado tecla "+keyCode);
        lastKey=keyCode;

        if (keyCode == KEYS_CODES.UP_2_JUG_1 || keyCode == KEYS_CODES.UP_1_JUG_1)// arriba izquierda
        {
            if (juegoOnline)
            {
                if (in_jugador2)
                    jugador2_subiendo=false;
                else
                    jugador1_subiendo=false;

                socket.emit('movimiento_jugador','subiendo',false);
            }else{
                jugador1_subiendo=false;
            }


        }else if (keyCode == KEYS_CODES.DOWN_1_JUG_1 || keyCode == KEYS_CODES.DOWN_2_JUG_1){ // abajo derecha

            if (juegoOnline)
            {
                if (in_jugador2)
                    jugador2_bajando=false;
                else
                    jugador1_bajando=false;

                socket.emit('movimiento_jugador','bajando',false);
            }else{
                jugador1_bajando=false;
            }
        }


        // Segundo jugador local
        if (juegoOnline==false)
        {
            if (keyCode == KEYS_CODES.UP_1_JUG_2 || keyCode == KEYS_CODES.UP_2_JUG_2)// arriba izquierda
                jugador2_subiendo=false;
            else if (keyCode == KEYS_CODES.DOWN_2_JUG_2 || keyCode ==  KEYS_CODES.DOWN_JUG_2) // abajo derecha
                jugador2_bajando=false;
        }
    }
    function key_down(keyCode){
        debug ("detectado tecla "+keyCode);
        lastKey=keyCode;

        if (keyCode == KEYS_CODES.UP_2_JUG_1 || keyCode == KEYS_CODES.UP_1_JUG_1)// arriba izquierda
        {
            if (juegoOnline)
            {

                if (document.activeElement.id == "mensaje")
                {
                    return;
                }

                if (in_jugador2)
                    jugador2_subiendo=true;
                else
                    jugador1_subiendo=true;

                socket.emit('movimiento_jugador','subiendo',true);
            }else{
                jugador1_subiendo=true;
            }

        }else if (keyCode == KEYS_CODES.DOWN_1_JUG_1 || keyCode == KEYS_CODES.DOWN_2_JUG_1){ // abajo derecha


            if (juegoOnline)
            {

                if (document.activeElement.id == "mensaje")
                {
                    return;
                }

                if (in_jugador2)
                    jugador2_bajando=true;
                else
                    jugador1_bajando=true;

                socket.emit('movimiento_jugador','bajando',true);
            }else{
                jugador1_bajando=true;
            }

        }

        // Estado de pausa
        if (keyCode == KEYS_CODES.PAUSE){

            if (document.activeElement.id == "mensaje")
            {
                return;
            }

            if (estado==ESTADO_ON)
            {
                if (juegoOnline){
                    socket.emit('pausa');
                    despausable=true;
                }
                self.set_cambio_estado_pausa();
            }else if(estado==ESTADO_PAUSA ){

                if (juegoOnline==false)
                    estado=ESTADO_ON;
                else if (juegoOnline &&  despausable)
                    socket.emit('despausar');
            }

        }

        // Segundo jugador local
        if (juegoOnline==false)
        {
            if (keyCode == KEYS_CODES.UP_1_JUG_2 || keyCode == KEYS_CODES.UP_2_JUG_2)// arriba izquierda
                jugador2_subiendo=true;
            else if (keyCode == KEYS_CODES.DOWN_2_JUG_2 || keyCode ==  KEYS_CODES.DOWN_JUG_2) // abajo derecha
                jugador2_bajando=true;
        }
    }

    this.set_movimiento_oponente= function (direccion,estado){
        if (in_jugador1==true)
        {
            eval('jugador2_'+direccion+'='+(estado ? 'true' : 'false'));
        }else{
            eval('jugador1_'+direccion+'='+(estado ? 'true' : 'false'));
        }
    }
    this.set_cambio_estado_on= function (){
        debug('empezando!');
        reiniciar_valores();
        movimiento_jugadores();
        estado=ESTADO_ON;
    }
    this.set_cambio_estado_pausa= function (){
        estado=ESTADO_PAUSA;
        self.cambio_estado(LANG.pausa);
    }
    this.set_cambio_estado_despausar= function (){
        estado=ESTADO_ON;
        despausable=false;
    }
    this.set_posicion_pelota=function (pelota_mov_y,pel_x,pel_y,pelota_direcc,pelota_mov_x){
        pelota_movimiento_y=pelota_mov_y;
        pelota_x=pel_x;
        pelota_y=pel_y;
        pelota_direccion=pelota_direcc;
        pelota_movimiento_x=pelota_mov_x;
    }
    this.gool=function(scor1,scor2){
        score1=scor1;
        score2=scor2;
        reiniciar_valores();
        GOL_AUDIO.play();
    }
    this.cambio_estado=function (text){
        context.font = 'italic 30px Calibri';
        context.textAlign = 'center';
        context.fillStyle = 'white';
        context.clearRect(0,0,canvas.width,canvas.height);
        context.fillText(text,canvas.width/2 , (canvas.height/2)+10);
    }
}

// crear una funcion para realizar un dashed line!
CanvasRenderingContext2D.prototype.dashedLine = function(x1, y1, x2, y2, dashLen,color) {
    if (dashLen == undefined) dashLen = 2;

    if (color) this.strokeStyle = color;


    this.beginPath();
    this.moveTo(x1, y1);

    var dX = x2 - x1;
    var dY = y2 - y1;
    var dashes = Math.floor(Math.sqrt(dX * dX + dY * dY) / dashLen);
    var dashX = dX / dashes;
    var dashY = dY / dashes;

    var q = 0;
    while (q++ < dashes) {
        x1 += dashX;
        y1 += dashY;
        this[q % 2 == 0 ? 'moveTo' : 'lineTo'](x1, y1);
    }
    this[q % 2 == 0 ? 'moveTo' : 'lineTo'](x2, y2);

    this.stroke();
    this.closePath();
};
// Estandarizado para los navegadores
window.requestAnimFrame=(function(){
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback,tiempo){window.setTimeout(callback,tiempo);};
})();