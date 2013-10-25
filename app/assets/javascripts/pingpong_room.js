function Sala(){
    var usuario_nombre='',oponente_nombre='';
    var sala='';
    var pingPong=null;
    var jugador1=false,jugador2=false;

    pingPong = new PingPong_MGD('canvas');

    function debug(str){
        console.log('sala: '+str);
    }
    this.nuevo_jugador=function (socket)
    {
        debug('nuevo_jugador');
        usuario_nombre=prompt(LANG.escribe_tu_nombre);
        sala=prompt(LANG.escribe_una_sala);
        socket.emit('adduser',usuario_nombre,sala);
    }
    this.sala_llena=function (socket)
    {
        debug('sala_llena');
        pingPong.cambio_estado(LANG.sala_llena);
        sala=prompt(LANG.sala);

        socket.emit('adduser',usuario_nombre,sala);
    }
    this.asignar_jugador=function (juga1,juga2)
    {
        debug('asignar_jugador');
        jugador1=juga1;
        jugador2=juga2;
    }
    this.asignar_oponente=function (opo)
    {
        debug('asignar_oponente '+ opo);
        oponente_nombre=opo;
    }
    this.iniciar_juego=function ()
    {
        debug('iniciar_juego');

        pingPong.configuracion_online(socket,jugador1,jugador2,usuario_nombre,oponente_nombre,sala);
        pingPong.start(true);
    }
    this.esperando_otro_jugador_ready=function ()
    {
        debug('esperando_otro_jugador_ready');
        pingPong.cambio_estado(LANG.esperando_al_otro_jugador);
    }
    this.empezar_juego=function ()
    {
        debug('empezar_juego');
        pingPong.set_cambio_estado_on();
    }
    this.movimiento_jugador=function (direccion,estado)
    {
        debug('movimiento_jugador: '+direccion+" "+estado);
        pingPong.set_movimiento_oponente(direccion,estado);
    }
    this.colision_pala=function (pelota_movimiento_y,pelota_x,pelota_y,pelota_direccion,pelota_movimiento_x)
    {
        debug('colision_pala reajuste posicion pelota');
        pingPong.set_posicion_pelota(pelota_movimiento_y,pelota_x,pelota_y,pelota_direccion,pelota_movimiento_x);
    }
    this.pausa=function ()
    {
        debug('pausa');
        pingPong.set_cambio_estado_pausa();
    }
    this.despausar=function ()
    {
        debug('despausar');
        pingPong.set_cambio_estado_despausar();
    }
    this.gool=function (score1,score2)
    {
        debug('gool');
        pingPong.gool(score1,score2);
    }
    this.desconexion_oponente=function ()
    {
        debug('desconexion_oponente');
        pingPong.set_cambio_estado_pausa();
        pingPong.cambio_estado(LANG.oponente_desconectado);
    }
    this.mensaje_key=function (evt)
    {
        if (evt.keyCode == 13)
        {
            debug('mensaje_key enviando mensaje');
            socket.emit('mensaje_chat',document.getElementById("mensaje").value);
            document.getElementById("mensaje").value="";
        }
    }
    this.mensaje=function (mesg)
    {
        pingPong.cambio_estado(mesg);
    }
}