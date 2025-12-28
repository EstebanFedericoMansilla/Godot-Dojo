// --- AUDIO SYSTEM ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(f, t, d, s = 0) {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = t; o.frequency.setValueAtTime(f, audioCtx.currentTime + s);
    g.gain.setValueAtTime(0.1, audioCtx.currentTime + s);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + s + d);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(audioCtx.currentTime + s); o.stop(audioCtx.currentTime + s + d);
}
const SFX = {
    click: () => { if (audioCtx.state === 'suspended') audioCtx.resume(); playTone(400, 'sine', 0.1); },
    select: () => { if (audioCtx.state === 'suspended') audioCtx.resume(); playTone(600, 'triangle', 0.05); },
    success: () => { playTone(523, 'sine', 0.2, 0); playTone(659, 'sine', 0.2, 0.1); playTone(783, 'square', 0.4, 0.2); },
    error: () => { playTone(150, 'sawtooth', 0.3); }
};

// --- REAL DATASET: 160 LEVELS (20 per Unit) ---
const levelsData = [];

const rawData = [
    // UNIT 1: FUNDAMENTOS
    ["Variable int", "int", "var vida: ____ = 100", ["int", "float", "String", "bool"], "📦", "Las variables guardan información. El tipo <b>int</b> se usa para números enteros.", "var nivel: int = 1"],
    ["Imprimir", "print", "____('Hola')", ["print", "echo", "log", "say"], "🖨️", "<b>print()</b> envía texto a la consola de Godot.", "print('Iniciando...')"],
    ["Comentario", "#", "____ Nota", ["#", "//", "--", "/*"], "📝", "Los comentarios con <b>#</b> son ignorados por el motor.", "# Nota"],
    ["Constante", "const", "____ PI = 3.14", ["const", "var", "let", "static"], "🔒", "Una <b>constante</b> nunca cambia su valor.", "const G = 9.8"],
    ["Heredar", "extends", "____ Sprite2D", ["extends", "inherits", "parent", "from"], "🌳", "<b>extends</b> define de qué tipo de objeto se trata el script.", "extends Node2D"],
    ["Nodo Rápido", "$", "var p = ____Player", ["$", "@", "#", "."], "🏷️", "El símbolo <b>$</b> es un atajo para buscar nodos hijos.", "$Escudo"],
    ["Inspector", "@export", "____ var v = 10", ["@export", "public", "@tool", "show"], "⚙️", "<b>@export</b> hace que la variable sea editable en el Inspector.", "@export var hp = 10"],
    ["Función", "func", "____ saltar():", ["func", "def", "method", "action"], "🏃", "Las funciones se definen con <b>func</b>.", "func correr(): pass"],
    ["Booleano", "true", "var vivo = ____", ["true", "on", "yes", "bit"], "⚖️", "<b>true</b> y <b>false</b> son valores lógicos.", "var activo = true"],
    ["Delta", "delta", "x += v * ____", ["delta", "time", "step", "dt"], "⏱️", "<b>delta</b> es el tiempo transcurrido entre frames.", "pos.x += speed * delta"],
    // U1 PRO
    ["Vector2", "Vector2", "var p: ____", ["Vector2", "Point", "Vec2", "XY"], "📐", "<b>Vector2</b> guarda coordenadas X e Y.", "var v = Vector2(0,0)"],
    ["Inicio", "_ready", "func ____():", ["_ready", "_init", "_start", "_play"], "✅", "<b>_ready()</b> corre al entrar el nodo a la escena.", "func _ready(): pass"],
    ["Color", "Color", "var c = ____.RED", ["Color", "Hex", "Tone", "RGB"], "🎨", "El tipo <b>Color</b> maneja valores RGBA.", "var c = Color.BLUE"],
    ["Absoluto", "abs", "var v = ____(-5)", ["abs", "min", "val", "max"], "🔢", "<b>abs()</b> quita el signo negativo.", "abs(-10)"],
    ["Saltar", "pass", "func f():\n  ____", ["pass", "null", "none", "skip"], "🕳️", "<b>pass</b> se usa cuando no quieres escribir código aún.", "func dummy(): pass"],
    ["Redondeo", "round", "____(4.2)", ["round", "ceil", "floor", "fix"], "🟣", "<b>round()</b> redondea al entero más cercano.", "round(4.6) # 5"],
    ["Texto", "String", "var s: ____", ["String", "Text", "Word", "Char"], "🔤", "<b>String</b> es el tipo para cadenas de texto.", "var s: String = 'Hi'"],
    ["Limitar", "clamp", "____(v, 0, 10)", ["clamp", "limit", "bound", "range"], "📎", "<b>clamp()</b> mantiene un valor entre un min y max.", "clamp(15, 0, 10)"],
    ["Físicas", "_physics_process", "func ____(d):", ["_physics_process", "_update", "_step", "_tick"], "⚙️", "Ideal para movimiento físico sincronizado.", "func _physics_process(d): pass"],
    ["Mate PI", "PI", "2 * ____", ["PI", "TAU", "INF", "NAN"], "🥧", "Constante matemática universal.", "var cir = 2 * PI"],

    // UNIT 2: LOGICA
    ["Condición", "if", "____ hp <= 0:", ["if", "when", "case", "ifnot"], "❓", "<b>if</b> evalúa si algo es cierto.", "if saldo > 0: pass"],
    ["De lo contrario", "else", "if A: pass\n____:", ["else", "otherwise", "than", "not"], "🛣️", "<b>else</b> corre si el 'if' falla.", "else: print('No')"],
    ["Igualdad", "==", "if A ____ B:", ["==", "=", "is", "equal"], "⚖️", "<b>==</b> compara; <b>=</b> asigna.", "if id == 1: pass"],
    ["Y Lógico", "and", "if A ____ B:", ["and", "&&", "with", "plus"], "🔗", "Ambas deben ser ciertas.", "if vivo and libre: pass"],
    ["Diferencia", "!=", "if A ____ B:", ["!=", "<>", "no", "isnt"], "🚫", "Verifica que sean distintos.", "if pos != target: pass"],
    ["O Lógico", "or", "if A ____ B:", ["or", "||", "any", "either"], "🌿", "Al menos una cierta.", "if red or blue: pass"],
    ["Mayor", ">", "if A ____ B:", [">", "<", "==", "!"], "⬆️", "Compara magnitud.", "if hp > 50: pass"],
    ["Negación", "not", "if ____ muerto:", ["not", "!", "false", "no"], "👎", "Invierte el valor.", "if not full: pass"],
    ["Sino Si", "elif", "____ hp > 0:", ["elif", "elseif", "case", "ifnot"], "🔄", "Condiciones encadenadas.", "elif hp < 10: pass"],
    ["Menor", "<", "if A ____ B:", ["<", ">", "==", "!"], "⬇️", "Compara magnitud menor.", "if x < 0: x = 0"],
    // U2 PRO
    ["Match", "match", "____ estado:", ["match", "switch", "case", "select"], "🚦", "Comprobación múltiple eficiente.", "match state: IDLE: pass"],
    ["Bucle For", "for", "____ i in 10:", ["for", "loop", "while", "each"], "🔄", "Repite N veces.", "for x in items: pass"],
    ["Bucle Mientras", "while", "____ vivo:", ["while", "until", "during", "for"], "⏳", "Repite mientras sea cierto.", "while searching: pass"],
    ["Diccionario", "{}", "var d = ____ 'id': 1 ____", ["{}", "[]", "()", "||"], "📖", "Mapas de Clave:Valor.", "var player = {'hp': 100}"],
    ["Señal", "signal", "____ cambio", ["signal", "event", "hook", "call"], "📡", "Avisos entre objetos.", "signal exploded"],
    ["Break", "break", "if A:\n  ____", ["break", "stop", "exit", "end"], "🔨", "Sale del bucle.", "if found: break"],
    ["Contiene", "in", "if x ____ lista:", ["in", "has", "with", "is"], "📥", "Busca dentro de una lista.", "if 'gold' in bag: pass"],
    ["Continuar", "continue", "if A:\n  ____", ["continue", "next", "pass", "skip"], "⏭️", "Salta a la siguiente vuelta del bucle.", "if empty: continue"],
    ["Retorno", "return", "____ 42", ["return", "give", "send", "out"], "📤", "Devuelve valor de una función.", "return result"],
    ["Buscar", "find", "a.____(x)", ["find", "get", "search", "idx"], "🔍", "Busca la posición en un array.", "var i = list.find(5)"],

    // UNIT 3: COMUNICACION
    ["Presionado", '"pressed"', "btn.connect(____, f)", ['"pressed"', '"click"', '"on"', 'id'], "🔗", "Conecta señales a funciones.", "btn.connect('pressed', _on_p)"],
    ["Emitir", "emit_signal", "____('win')", ["emit_signal", "push", "send", "call"], "📡", "Dispara una señal.", "emit_signal('ready')"],
    ["Árbol", "get_tree", "____().quit()", ["get_tree", "get_root", "game", "main"], "🌲", "Acceso a la estructura global.", "get_tree().paused = true"],
    ["Grupo", "add_to_group", "____('enemy')", ["add_to_group", "join", "tag", "set"], "👥", "Etiqueta nodos para manejo grupal.", "add_to_group('objs')"],
    ["Checar Grupo", "is_in_group", "n.____('npc')", ["is_in_group", "has", "check", "in"], "🕵️", "Verifica la etiqueta del nodo.", "if n.is_in_group('p'): pass"],
    ["Proceso", "process", "set____(false)", ["process", "run", "active", "live"], "😴", "Detiene o activa el procesado por frame.", "set_process(true)"],
    ["Llamar Grupo", "call_group", "t.____('g', 'f')", ["call_group", "tell", "run", "do"], "📢", "Ejecuta función en todo un grupo.", "call_group('all', 'hide')"],
    ["Una vez", "CONNECT_ONE_SHOT", "____", ["CONNECT_ONE_SHOT", "ONCE", "1", "ONLY"], "1️⃣", "Conexión que se borra tras un uso.", "connect(s, f, CONNECT_ONE_SHOT)"],
    ["Visible", "visible", "n.____ = true", ["visible", "shown", "draw", "alpha"], "👻", "Define si el nodo se dibuja.", "sprite.visible = false"],
    ["Dueño", "owner", "n.____ = self", ["owner", "root", "master", "parent"], "👑", "El nodo raíz de la escena.", "new_node.owner = self"],
    // U3 PRO
    ["Parámetros", "x", "signal s(____)", ["x", "1", "val:int", ":int"], "📊", "Envía datos en las señales.", "signal hp_changed(nuevo_hp)"],
    ["Desconectar", "disconnect", "____(s, f)", ["disconnect", "remove", "off", "unhook"], "✂️", "Corta el vínculo señal-función.", "btn.disconnect(s, f)"],
    ["Await", "await", "____(t, 's')", ["await", "yield", "wait", "stop"], "⌛", "Espera a que ocurra una señal.", "await get_tree().timer(1).timeout"],
    ["Conectado?", "is_connected", "____(s, f)", ["is_connected", "has", "check", "link"], "🔌", "Verifica si ya hay conexión.", "if is_connected(s, f): pass"],
    ["Diferido", "set_deferred", "____('v', 1)", ["set_deferred", "later", "delay", "wait"], "🕒", "Cambia valor al final del frame.", "set_deferred('disabled', true)"],
    ["Obtener Nodo", '"Name"', "get_node(____)", ['"Name"', 'Name', '$N', 'id'], "🔍", "Obtiene nodo por nombre/ruta.", "get_node('Player/Head')"],
    ["Hijo", "find_child", "____('Hand')", ["find_child", "get", "search", "seek"], "🕵️‍♂️", "Busca hijo por nombre.", "var h = find_child('Sword')"],
    ["Llamado Dif", "call_deferred", "____('f')", ["call_deferred", "later", "wait", "soon"], "⚡", "Ejecuta función luego.", "call_deferred('free')"],
    ["Contar", "child_count", "get____()", ["child_count", "size", "total", "len"], "🔢", "Número de hijos directos.", "var n = get_child_count()"],
    ["Libre", "queue_free", "n.____()", ["queue_free", "free", "del", "bye"], "🧹", "Borrado seguro de nodos.", "n.queue_free()"],

    // UNIT 4: NODOS
    ["Instanciar", "instantiate", "sc.____()", ["instantiate", "new", "create", "spawn"], "🏠", "Crea objeto desde escena guardada.", "var p = scene.instantiate()"],
    ["Añadir", "add_child", "____(node)", ["add_child", "push", "append", "parent"], "➕", "Mete el nodo a la jerarquía.", "add_child(new_obj)"],
    ["Borrar", "queue_free", "____()", ["queue_free", "delete", "free", "kill"], "🗑️", "Elimina el nodo del juego.", "self.queue_free()"],
    ["Padre", "get_parent", "____()", ["get_parent", "up", "master", "root"], "👴", "Obtiene el nodo superior.", "var p = get_parent()"],
    ["Nombre", "name", "n.____ = 'X'", ["name", "id", "tag", "label"], "📛", "Identificador del nodo.", "node.name = 'Enemy'"],
    ["Tipo", "is", "n ____ Sprite", ["is", "type", "has", "of"], "🧬", "Verifica si es de una clase.", "if x is Button: pass"],
    ["Repadre", "reparent", "____(new)", ["reparent", "move", "change", "set_p"], "👪", "Cambia de padre manteniendo posición.", "obj.reparent(main)"],
    ["Local", "position", "____ = V2.0", ["position", "local", "pos", "x_y"], "📍", "Posición respecto al padre.", "position.x += 10"],
    ["Global", "global_position", "____ = V2.0", ["global_position", "world", "real", "abs"], "🌍", "Posición real en el mundo.", "global_position = m"],
    ["Z Orden", "move_child", "____(n, 0)", ["move_child", "order", "z", "depth"], "🔝", "Cambia orden de apilamiento.", "move_child(bg, 0)"],
    // U4 PRO
    ["Cargar", "load", "____('path')", ["load", "fetch", "get", "read"], "💾", "Carga recurso desde disco.", "var img = load('res://icon.png')"],
    ["Precarga", "preload", "____('path')", ["preload", "load", "async", "early"], "⚡", "Carga antes de ejecutar para evitar lag.", "var s = preload('res://s.tscn')"],
    ["Raíz Escena", "owner", "n.____ = self", ["owner", "root", "p", "tree"], "🏗️", "Dueño de la escena para guardar nodos.", "n.owner = self"],
    ["Ancestro", "is_ancestor_of", "____(p)", ["is_ancestor_of", "has", "in", "p"], "👴", "Verifica si es tatarabuelo.", "if root.is_ancestor_of(n): pass"],
    ["Ruta", "get_path", "____()", ["get_path", "url", "link", "route"], "🛤️", "Dirección completa del nodo.", "var p = get_path()"],
    ["Posición Z", "z_index", "____ = 1", ["z_index", "layer", "depth", "order"], "📑", "Prioridad de dibujo.", "z_index = 10"],
    ["Capa", "layer", "collision____ = 1", ["layer", "mask", "bit", "idx"], "🧱", "Capa donde reside el objeto.", "collision_layer = 1"],
    ["Máscara", "mask", "collision____ = 1", ["mask", "layer", "find", "on"], "🔍", "Capas que el objeto detecta.", "collision_mask = 2"],
    ["Único %", "%", "____Name", ["%", "$", "@", "&"], "✨", "Nombre único de escena.", "%Player.hide()"],
    ["Hijos Totales", "get_children", "____()", ["get_children", "all", "list", "nodes"], "👨‍👩‍👧‍👦", "Obtiene lista de todos los hijos.", "var l = get_children()"],

    // UNIT 5: VECTORES (Movimiento Real)
    ["Vector Cero", "ZERO", "Vector2.____", ["ZERO", "NULL", "EMPTY", "0"], "0️⃣", "Punto origen (0,0).", "pos = Vector2.ZERO"],
    ["Arriba", "UP", "Vector2.____", ["UP", "NORTH", "TOP", "Y-"], "⬆️", "Dirección hacia arriba (0, -1).", "vel = Vector2.UP"],
    ["Derecha", "RIGHT", "Vector2.____", ["RIGHT", "EAST", "SIDE", "X+"], "➡️", "Dirección derecha (1, 0).", "vel = Vector2.RIGHT"],
    ["Distancia", "distance_to", "A.____(B)", ["distance_to", "gap", "far", "len"], "📏", "Mide distancia en píxeles.", "var d = p1.distance_to(p2)"],
    ["Dirección", "direction_to", "A.____(B)", ["direction_to", "look", "to", "aim"], "🧭", "Vector unitario al objetivo.", "var d = a.direction_to(b)"],
    ["Largo", "length", "V.____()", ["length", "size", "magnitude", "dist"], "📐", "Calcula la longitud del vector.", "var s = v.length()"],
    ["Normalizados", "normalized", "V.____()", ["normalized", "fixed", "one", "tiny"], "📏", "Vector con largo 1 (dirección pura).", "v = v.normalized()"],
    ["Ángulo", "angle", "V.____()", ["angle", "rot", "deg", "rad"], "📐", "Devuelve el ángulo en radianes.", "var a = v.angle()"],
    ["Mirar", "look_at", "____(target)", ["look_at", "face", "aim", "turn"], "👀", "Rota hacia una posición global.", "look_at(mouse)"],
    ["Rotar Deg", "deg_to_rad", "____(90)", ["deg_to_rad", "rad", "angle", "fix"], "🔄", "Convierte grados a radianes.", "rotate(deg_to_rad(45))"],
    // U5 PRO
    ["Rebote", "bounce", "V.____(N)", ["bounce", "reflect", "mirror", "flip"], "🪞", "Refleja vector contra una normal N.", "v = v.bounce(normal)"],
    ["Interpolación", "lerp", "____(A,B,0.1)", ["lerp", "move", "glide", "smooth"], "🌊", "Movimiento suave gradual.", "v = lerp(v, target, 0.1)"],
    ["Mover Hacia", "move_toward", "____(t, vel)", ["move_toward", "approach", "go", "step"], "🚶", "Movimiento a velocidad constante.", "v = move_toward(v, target, 100)"],
    ["Deslizar", "slide", "V.____(N)", ["slide", "glide", "ignore", "along"], "🛹", "Fisica de deslizamiento en paredes.", "v = v.slide(normal)"],
    ["Prod Punto", "dot", "A.____(B)", ["dot", "inner", "mul", "flat"], "⚫", "Mide alineación entre vectores.", "if a.dot(b) > 0: pass"],
    ["Prod Cruz", "cross", "A.____(B)", ["cross", "side", "det", "up"], "✖️", "Determina lado (izq/der).", "var s = a.cross(b)"],
    ["Proyectar", "project", "A.____(B)", ["project", "cast", "shadow", "fit"], "🔦", "Sombra de A sobre B.", "v = a.project(b)"],
    ["Rotar Hacia", "rotate_toward", "____(t, s)", ["rotate_toward", "turn", "lerp_r", "spin"], "🌀", "Giro suave suavizado.", "r = rotate_toward(r, t, 0.1)"],
    ["Seno", "sin", "____(T)", ["sin", "wave", "cos", "osc"], "📈", "Ondas matemáticas suaves.", "pos.y += sin(time)"],
    ["Coseno", "cos", "____(T)", ["cos", "sin", "tan", "side"], "📉", "Usado para movimientos circulares.", "x = cos(t) * radius"],

    // UNIT 6: DATOS
    ["Resource", "Resource", "extends ____", ["Resource", "Data", "Tres", "Config"], "📄", "Objeto de datos puro.", "extends Resource"],
    ["Save Res", "save", "Saver.____(r, p)", ["save", "write", "store", "put"], "💾", "Guarda recurso a disco.", "ResourceSaver.save(res, path)"],
    ["Load Res", "load", "Loader.____(p)", ["load", "fetch", "get", "read"], "📥", "Carga recurso desde disco.", "ResourceLoader.load(path)"],
    ["Meta Data", "set_meta", "____('id', 1)", ["set_meta", "tag", "data", "info"], "🆔", "Datos invisibles en nodos.", "n.set_meta('lvl', 5)"],
    ["Config File", "ConfigFile", "var c = ____", ["ConfigFile", "Settings", "Ini", "File"], "📝", "Para archivos de configuración .cfg", "var c = ConfigFile.new()"],
    ["Set Val", "set_value", "c.____(s, k, v)", ["set_value", "add", "write", "put"], "⌨️", "Guarda valor en ConfigFile.", "cfg.set_value('S', 'K', V)"],
    ["Get Val", "get_value", "c.____(s, k)", ["get_value", "read", "fetch", "get"], "🔍", "Recupera valor de ConfigFile.", "var v = cfg.get_value('S','K')"],
    ["Path Res", "res://", "____icon.png", ["res://", "user://", "app://", "C:/"], "📂", "Ruta raíz del proyecto.", "load('res://icon.png')"],
    ["Path User", "user://", "____save.dat", ["user://", "res://", "local://", "tmp://"], "👤", "Ruta para guardados de usuario.", "user://settings.cfg"],
    ["Duplicar", "duplicate", "res.____()", ["duplicate", "copy", "clone", "new"], "👯", "Crea copia única de recurso.", "var r2 = r1.duplicate()"],
    // U6 PRO
    ["JSON Parse", "parse_string", "JSON.____(s)", ["parse_string", "read", "decode", "to_obj"], "📊", "Convierte texto JSON a datos.", "var d = JSON.parse_string(txt)"],
    ["JSON String", "stringify", "JSON.____(d)", ["stringify", "encode", "to_txt", "write"], "🧵", "Convierte datos a texto JSON.", "var s = JSON.stringify(data)"],
    ["Access", "FileAccess", "____.open(p, m)", ["FileAccess", "IO", "Reader", "FS"], "📁", "Control binario de archivos.", "var f = FileAccess.open(p, mode)"],
    ["Store", "store_line", "f.____(t)", ["store_line", "write", "add", "put"], "✏️", "Escribe linea de texto.", "f.store_line('Hola')"],
    ["Exists", "file_exists", "FileAccess.____(p)", ["file_exists", "has", "is_file", "exists"], "🧐", "Verifica si archivo existe.", "if FileAccess.file_exists(p):"],
    ["Dir", "DirAccess", "____.open(p)", ["DirAccess", "Folders", "Files", "Storage"], "📁", "Control de carpetas.", "var d = DirAccess.open('res://')"],
    ["List Files", "get_files", "dir.____()", ["get_files", "list", "all", "read"], "📚", "Lista archivos en carpeta.", "var l = d.get_files()"],
    ["Key Crypt", "save_encrypted", "____(p, key)", ["save_encrypted", "lock", "crypt", "safe"], "🔐", "Guarda datos cifrados.", "cfg.save_encrypted_pass(p, k)"],
    ["Time Dict", "get_datetime_dict_from_system", "Time.____()", ["get_datetime_dict_from_system", "now", "clock", "date"], "⏰", "Fecha y hora del sistema.", "var t = Time.get_datetime_dict_from_system()"],
    ["OS Name", "get_name", "OS.____()", ["get_name", "platform", "os", "type"], "💻", "Nombre del sistema (Windows/Android).", "var s = OS.get_name()"],

    // UNIT 7: UI
    ["Control Node", "Control", "extends ____", ["Control", "UI", "Window", "Box"], "🖼️", "Base para toda la interfaz.", "extends Control"],
    ["CanvasLayer", "CanvasLayer", "____ (Layer)", ["CanvasLayer", "HUD", "Layer", "Screen"], "📑", "Capa fija sobre el juego.", "extends CanvasLayer"],
    ["TextureRect", "texture", "n.____ = img", ["texture", "image", "art", "sprite"], "🖼️", "Muestra imágenes en UI.", "tr.texture = load('res://logo.png')"],
    ["Label Text", "text", "l.____ = 'Hi'", ["text", "val", "label", "string"], "🔤", "Muestra texto simple.", "label.text = 'Puntos: 0'"],
    ["RichText", "append_text", "rtl.____('[b]H[/b]')", ["append_text", "add", "write", "push"], "📝", "Texto con formato BBCode.", "rtl.append_text('[color=red]A![/color]')"],
    ["Value", "value", "pb.____ = 100", ["value", "progress", "amt", "ratio"], "📊", "Valor de barras de carga.", "bar.value = hp"],
    ["Button", "pressed", "btn.____", ["pressed", "click", "on", "active"], "🖱️", "Señal de click de botón.", "btn.pressed.connect(_on_p)"],
    ["Audio Play", "play", "ap.____()", ["play", "start", "run", "do"], "🔊", "Reproduce sonido.", "audio.play()"],
    ["Audio Vol", "volume_db", "ap.____ = -10", ["volume_db", "gain", "db", "sound"], "🎚️", "Volumen en decibelios.", "audio.volume_db = 0"],
    ["Mouse Filter", "MOUSE_FILTER_IGNORE", "____", ["MOUSE_FILTER_IGNORE", "PASS", "STOP", "NONE"], "🖱️", "Hacer que la UI sea traspasable.", "mouse_filter = MOUSE_FILTER_IGNORE"],
    // U7 PRO
    ["Theme", "theme", "gui.____ = t", ["theme", "style", "look", "skin"], "🎨", "Diseño global de UI.", "control.theme = preload('res://main.theme')"],
    ["StyleBox", "StyleBox", "____Flat.new()", ["StyleBox", "Box", "Panel", "Skin"], "📦", "Dibujo de fondos de UI.", "var s = StyleBoxFlat.new()"],
    ["Viewport", "get_viewport", "____().size", ["get_viewport", "get_window", "root", "scene"], "📺", "Acceso al área de visión.", "var s = get_viewport().size"],
    ["Grab Focus", "grab_focus", "btn.____()", ["grab_focus", "select", "activate", "hi"], "🎯", "Pone el cursor/foco en el control.", "btn.grab_focus()"],
    ["Tween", "create_tween", "____()", ["create_tween", "anim", "lerp", "glide"], "📉", "Animaciones matemáticas rápidas.", "var t = create_tween()"],
    ["Tween P", "tween_property", "t.____(o, 'p', v, t)", ["tween_property", "to", "set", "anim"], "⏩", "Anima una propiedad.", "t.tween_property(node, 'modulate:a', 0, 1)"],
    ["Audio Bus", "get_bus_index", "Server.____('M')", ["get_bus_index", "find", "bus", "idx"], "🎧", "Busca canal de audio (Master).", "var idx = AudioServer.get_bus_index('Master')"],
    ["Custom Cursor", "set_custom_mouse_cursor", "Input.____(i)", ["set_custom_mouse_cursor", "cursor", "mouse", "art"], "🖱️", "Cambia el diseño del ratón.", "Input.set_custom_mouse_cursor(img)"],
    ["Timer", "create_timer", "tree.____(1.5)", ["create_timer", "wait", "delay", "gap"], "⏲️", "Reloj de un solo uso.", "await get_tree().create_timer(1).timeout"],
    ["Popup", "popup", "p.____()", ["popup", "show", "open", "modal"], "🪟", "Muestra ventanas emergentes.", "window.popup_centered()"],

    // UNIT 8: SHADERS
    ["Shader Type", "canvas_item", "shader_type ____;", ["canvas_item", "spatial", "particles", "sprite"], "🎨", "Define para qué es el shader (2D).", "shader_type canvas_item;"],
    ["Fragment", "fragment", "void ____()", ["fragment", "pixel", "color", "draw"], "🖌️", "Corre por cada píxel.", "void fragment() { }"],
    ["Vertex", "vertex", "void ____()", ["vertex", "point", "mesh", "shape"], "📐", "Corre por cada vértice.", "void vertex() { }"],
    ["Color Out", "COLOR", "____ = vec4(1.0);", ["COLOR", "ALBEDO", "OUT", "PIXEL"], "🌈", "Variable de salida del color.", "COLOR = vec4(1, 0, 0, 1);"],
    ["UV Map", "UV", "vec2 uv = ____;", ["UV", "XY", "MAP", "COORDS"], "🗺️", "Coordenadas del píxel (0 a 1).", "vec2 uv = UV;"],
    ["Time Var", "TIME", "float t = ____;", ["TIME", "CLOCK", "DELTA", "T"], "⌚", "Tiempo acumulado en segundos.", "float s = sin(TIME);"],
    ["Uniform", "uniform", "____ vec4 col;", ["uniform", "export", "var", "public"], "⚙️", "Variable que viene de Godot.", "uniform float speed;"],
    ["Texture Sam", "texture", "____(TEXTURE, UV)", ["texture", "sample", "read", "fetch"], "🖼️", "Lee color de una imagen.", "vec4 c = texture(TEXTURE, UV);"],
    ["Material", "material", "n.____ = mat", ["material", "shader", "look", "fx"], "✨", "Contenedor del shader en el nodo.", "sprite.material = mat"],
    ["Set Uniform", "set_shader_parameter", "mat.____('v', 1)", ["set_shader_parameter", "set_uniform", "send", "put"], "📡", "Envía datos desde GDScript al Shader.", "mat.set_shader_parameter('time', 1.0)"],
    // U8 PRO
    ["Screen Tex", "SCREEN_TEXTURE", "____", ["SCREEN_TEXTURE", "BACK_TEX", "VIEW", "WIN"], "📺", "Captura lo que hay detrás del nodo.", "vec4 c = texture(SCREEN_TEXTURE, SCREEN_UV);"],
    ["Smooth", "smoothstep", "____(0, 1, x)", ["smoothstep", "lerp", "fade", "ease"], "📉", "Transición suave entre bordes.", "float f = smoothstep(0.4, 0.5, d);"],
    ["Cosine", "cos", "____(TIME)", ["cos", "sin", "tan", "wave"], "〰️", "Onda desfasada 90 deg.", "float x = cos(TIME);"],
    ["Length", "length", "____(uv)", ["length", "dist", "size", "mag"], "📏", "Largo de un vector en shader.", "float d = length(UV - 0.5);"],
    ["Mix", "mix", "____(A, B, 0.5)", ["mix", "lerp", "blend", "join"], "🧪", "Mezcla dos colores.", "COLOR = mix(red, blue, 0.5);"],
    ["Vertex Move", "VERTEX", "____ += vec2(10.0);", ["VERTEX", "POS", "POINT", "XYZ"], "📍", "Mueve los puntos del modelo.", "VERTEX.x += sin(TIME);"],
    ["Discard", "discard", "if (a < 0.1) ____;", ["discard", "kill", "stop", "null"], "🗑️", "No dibuja el píxel (transparente).", "if (dist > 1.0) discard;"],
    ["Light Func", "light", "void ____()", ["light", "shadow", "shine", "glow"], "💡", "Cálculos de iluminación.", "void light() { }"],
    ["Step Func", "step", "____(0.5, x)", ["step", "cut", "edge", "floor"], "🪜", "Corte duro (0 o 1).", "float mask = step(0.5, UV.x);"],
    ["Mod Func", "mod", "____(TIME, 1.0)", ["mod", "rem", "loop", "repeat"], "🔁", "Bucle infinito de valores.", "float t = mod(TIME, 2.0);"]
];

// Mapeo dinámico para asegurar IDs, emojis y contenido
rawData.forEach((d, idx) => {
    levelsData.push({
        u: Math.floor(idx / 20) + 1,
        pro: (idx % 20) >= 10,
        q: d[0],
        ans: d[1],
        code: d[2].replace(d[1], "____"),
        opts: d[3],
        ic: d[4],
        theory: d[5],
        ex: d[6]
    });
});

// --- STATE ---
let completedLevels = [];
let isPro = false;
let gems = 0;
let streak = 0;
let currentPlayingLevel = 0;
let currentSelection = "";

// --- DOM ---
const viewMap = document.getElementById('view-map');
const viewTheory = document.getElementById('view-theory');
const viewLesson = document.getElementById('view-lesson');
const containers = [
    document.getElementById('path-container'),
    document.querySelector('.locked-zone'),
    document.getElementById('path-u3'),
    document.getElementById('path-u4'),
    document.getElementById('path-u5'),
    document.getElementById('path-u6'),
    document.getElementById('path-u7'),
    document.getElementById('path-u8')
];

// --- NAVIGATION ---
window.jumpToUnit = (unitNumber) => {
    SFX.click();
    const target = document.getElementById(`unit-title-${unitNumber}`);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function renderMap() {
    containers.forEach(c => { if (c) c.innerHTML = ''; });

    // IDs de navegación
    const dividers = document.querySelectorAll('.path-divider');
    dividers.forEach((div, idx) => { div.id = `unit-title-${idx + 2}`; });

    document.getElementById('gems-count').innerText = gems;
    document.getElementById('streak-count').innerText = streak;
    if (isPro) {
        document.getElementById('pro-status-tag').classList.remove('hidden');
        document.querySelector('.pro-badge').innerText = "PRO ACTIVE";
        document.querySelector('.pro-badge').style.opacity = "0.7";
    }

    let firstIncomplete = levelsData.findIndex((_, idx) => !completedLevels.includes(idx));
    if (firstIncomplete === -1) firstIncomplete = 159;

    levelsData.forEach((lvl, i) => {
        const container = containers[lvl.u - 1];
        if (!container) return;

        const unitBase = (lvl.u - 1) * 20;
        if (i === unitBase + 10) {
            const sep = document.createElement('div');
            sep.className = 'pro-separator';
            sep.innerHTML = `<span>🔒 CONTENIDO PREMIUM</span>`;
            container.appendChild(sep);
        }

        const node = document.createElement('div');
        node.className = 'level-node';
        const isCompleted = completedLevels.includes(i);
        const canPlay = !lvl.pro || isPro;

        if (isCompleted) {
            node.classList.add('completed');
            node.innerText = lvl.ic;
        } else if (i === firstIncomplete) {
            if (lvl.pro && !isPro) node.classList.add('locked');
            else { node.classList.add('current'); node.innerText = lvl.ic; }
        } else if (canPlay) {
            node.innerText = lvl.ic;
        } else {
            node.classList.add('locked');
            node.innerText = i + 1;
        }

        node.onclick = () => {
            SFX.click();
            if (lvl.pro && !isPro) {
                alert("Nivel PRO. ¡Desbloquéalo comprando PREMIUM!");
                return;
            }
            showTheory(i);
        };
        container.appendChild(node);
    });
}

function showTheory(index) {
    currentPlayingLevel = index;
    const lvl = levelsData[index];

    document.getElementById('theory-title').innerText = lvl.q;
    document.getElementById('theory-icon').innerText = lvl.ic;
    document.getElementById('theory-text').innerHTML = lvl.theory;
    document.getElementById('theory-code').innerText = lvl.ex;

    viewMap.classList.add('hidden');
    viewTheory.classList.remove('hidden');
}

function startQuiz() {
    viewTheory.classList.add('hidden');
    viewLesson.classList.remove('hidden');
    resetLessonUI();
    const lvl = levelsData[currentPlayingLevel];
    document.getElementById('question-text').innerText = lvl.q;
    document.getElementById('code-display').innerHTML = lvl.code.replace('____', `<span class="blank-space" id="target-blank">____</span>`).replace(/\n/g, '<br>');

    const optsCont = document.getElementById('options-container');
    optsCont.innerHTML = '';
    [...lvl.opts].sort(() => Math.random() - 0.5).forEach(o => {
        const b = document.createElement('button');
        b.className = 'option-btn';
        b.innerText = o;
        b.onclick = () => {
            SFX.click();
            document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
            b.classList.add('selected');
            document.getElementById('target-blank').innerText = o;
            document.getElementById('target-blank').classList.add('filled');
            document.getElementById('check-btn').disabled = false;
            currentSelection = o;
        };
        optsCont.appendChild(b);
    });
}

function checkAnswer() {
    const isCorrect = currentSelection === levelsData[currentPlayingLevel].ans;
    document.getElementById('check-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.remove('hidden');

    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackDetail = document.getElementById('feedback-detail');

    if (isCorrect) {
        SFX.success();
        document.getElementById('footer-bar').classList.add('correct');
        feedbackTitle.innerText = "¡Excelente!";
        feedbackDetail.innerText = "¡Sigue así, lo estás logrando!";
        if (!completedLevels.includes(currentPlayingLevel)) {
            completedLevels.push(currentPlayingLevel);
            gems += 10; streak++;
        }
    } else {
        SFX.error();
        document.getElementById('footer-bar').classList.add('wrong');
        feedbackTitle.innerText = "¡Casi!";
        feedbackDetail.innerText = "¡No te rindas, dale de nuevo!";
        streak = 0;
    }
    document.getElementById('feedback-msg').classList.remove('hidden');
}

function resetLessonUI() {
    document.getElementById('footer-bar').className = 'bottom-bar';
    document.getElementById('feedback-msg').classList.add('hidden');
    document.getElementById('check-btn').classList.remove('hidden');
    document.getElementById('check-btn').disabled = true;
    document.getElementById('next-btn').classList.add('hidden');
    document.getElementById('progress-bar').style.width = ((currentPlayingLevel / levelsData.length) * 100) + "%";
}

// --- PRO MODE / URL CLEANER ---
const SECRET_KEY = 'cliente_vip_enero_2026';
const urlParams = new URLSearchParams(window.location.search);

function activatePro(silent = false) {
    isPro = true;
    localStorage.setItem('godot_dojo_pro_link', SECRET_KEY);
    // Also update global save object
    const currentSave = JSON.parse(localStorage.getItem('godotDojoMaster') || '{}');
    currentSave.p = true;
    localStorage.setItem('godotDojoMaster', JSON.stringify(currentSave));

    if (!silent) {
        alert("✅ ¡Modo PRO Activado!");
        location.reload();
    }
}

if (urlParams.get('access') === SECRET_KEY) {
    activatePro(true);
    window.history.replaceState({}, document.title, window.location.pathname);
    setTimeout(() => alert("¡Pago confirmado! Modo PRO desbloqueado por 30 días."), 500);
}

if (localStorage.getItem('godot_dojo_pro_link') === SECRET_KEY) isPro = true;

// EVENTS
document.getElementById('start-quiz-btn').onclick = startQuiz;
document.getElementById('back-to-map-btn').onclick = () => {
    viewTheory.classList.add('hidden');
    viewMap.classList.remove('hidden');
};
document.getElementById('check-btn').onclick = checkAnswer;
document.getElementById('next-btn').onclick = () => {
    viewLesson.classList.add('hidden');
    viewMap.classList.remove('hidden');
    renderMap();
};
document.getElementById('exit-lesson-btn').onclick = () => {
    viewLesson.classList.add('hidden');
    viewMap.classList.remove('hidden');
};
document.getElementById('save-btn').onclick = () => {
    localStorage.setItem('godotDojoMaster', JSON.stringify({ c: completedLevels, g: gems, s: streak, p: isPro }));
    alert("¡Progreso Guardado!");
};
document.getElementById('reset-btn').onclick = () => {
    if (confirm("¿Reiniciar progreso?")) {
        completedLevels = []; gems = 0; streak = 0; isPro = false;
        localStorage.removeItem('godotDojoMaster');
        localStorage.removeItem('godot_dojo_pro_link');
        renderMap();
        location.reload();
    }
};

// --- PAYMENT MODAL LOGIC ---
const payModal = document.getElementById('payment-modal');
const openPay = () => { SFX.click(); payModal.classList.remove('hidden'); };
const closePay = () => { payModal.classList.add('hidden'); };

document.querySelector('.pro-badge').onclick = openPay;
document.querySelector('.close-modal-pay').onclick = closePay;
window.onclick = (e) => { if (e.target === payModal) closePay(); };

window.copyMPLink = () => {
    navigator.clipboard.writeText('https://mpago.la/1hAUANX').then(() => {
        alert("Link copiado. ¡Pégalo en tu navegador al terminar el pago!");
    });
};

document.getElementById('verify-code-btn').onclick = () => {
    let input = document.getElementById('manual-code-input').value.trim();
    if (!input) return;

    if (input.includes('access=')) {
        const match = input.match(/access=([^&]*)/);
        if (match) input = match[1];
    }

    if (input === SECRET_KEY) {
        activatePro();
    } else {
        alert("❌ Código no válido.");
    }
};

document.getElementById('start-learning-btn').onclick = () => {
    document.getElementById('view-intro').classList.add('hidden');
    viewMap.classList.remove('hidden');
    renderMap();
};

const s = localStorage.getItem('godotDojoMaster');
if (s) {
    const d = JSON.parse(s);
    completedLevels = d.c || [];
    gems = d.g || 0;
    streak = d.s || 0;
    if (d.p) isPro = true;
}

renderMap();
