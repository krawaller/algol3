

// ################## G A M E D E F   D A T A   T Y P E S ##################

"MYUNITS": 
"OPPUNITS": 

query
	ALLUNITS
	UNITS // ["FILTER","ALLUNITS",{"status":["ISNT","dead"]}]
	MYUNITS  // ["FILTER","UNITS",{"plr":["TURNVAR","CURRENTPLAYER"]}],
	OPPUNITS // ["FILTER","UNITS",{"plr":["ISNT",["TURNVAR","CURRENTPLAYER"]]}],
	DEADUNITS // ["FILTER","ALLUNITS",{"status":"dead"}],
	TERRAIN
	LOCATIONS
	<generatedname>
	<customqueryname>

customquerydef
	FILTER(query,matchobj)
	MERGE(query,stealobj,query,stealobj)

stealobj
	{oldpropname:newpropname,...}

matchobj
	{propname:propmatcher,...}

propobj
	{propname:value,...}

propmatcher
	ISNT(value)
	value

position
	<markname>
	OFFSET(position,direction,instruction)
	ONLYIN(query)
	TURNPOS(name)
	START //in generator
	TARGET //in generator

value
	LOOKUP(query,position,propname)
	IFELSE(boolean,value,value)
	ARTIFACT(propname) //in generator
	TURNVAR(propname)
	UNITTURNVAR(id,propname)
	SUM(value,...)
	id
	dir
	<primitive>

generatename
	*IFELSE(boolean,generatename,generatename)
	IF(boolean,generatename)
	UNLESS(boolean,generatename)
	<string>

propobj
	{propname:value, ...}
	LOOKUPALL(query,position,[propname,...])

boolean
	NOT(boolean)
	SAME(value,value)
	DIFFERENT(value,value)
	AND(boolean,...)
	OR(boolean,...)
	ANYAT(query,position)
	NONEAT(query,position)
	EMPTY(query)
	NOTEMPTY(query)
	ONEOF(value,[value,...])
	MATCHAT(query,position,matchobj)

id
	IDAT(position)

dir
	DIRAT(position)
	TURN(direction,turns)
	<int>

effect
	MOVEUNIT(id,position)
	KILLUNIT(id)
	TURNUNIT(id,turns)
	SETUNITVAR(id,value)
	SETUNITTURNVAR(id,name,value)
	SETTURNVAR(name,value)
	SETTURNPOS(name,position)
	CREATETERRAIN(position,propobj)

// ################## F L O W   D A T A   T Y P E S ##################

save
	game: gamename,
	board: boardname, // or none
	setup: setupname, // or none
	unitchanges:
		{id:{prop:[step,val,...],...},...}
	terrainchanges:
		{id:{prop:[step,val,...],...},...}
	steps:
		[[plr,cmnd,[mark,x,y],[mark,x,y],...]]
	status: ["current"/endgame,who]
	turn:
		CURRENTPLAYER: plr
		var: {}
		pos: {}
		unit: {}

state // terrain,units
	id: {prop:val,...}, ...

queryresult:
	positions: [ykx,ykx,...]
	contains:
		ykx: true,
		ykx: true, ...
	data:
		ykx: {prop:val,...}, ...

battle
	cache

aliases: // generate at battlestart
	plrnumber:
		MYUNITS: PLR1UNITS
		OPPUNITS: PLR2UNITS / NOTPLR1UNITS

// ################# Q U E R I E S #####################

A query can be:
	customquery (defined)
	generated, needs generator
	alias: MYUNITS,OPPUNITS
	predefgroup: UNITS,ALLUNITS,DEADUNITS
	customgroup: kings

// ################# G A M E   F L O W #####################

click on a square
evaluate a query! (needs dependencies?)
execute command!

askForResult(queryref){
	
}

// ################## D E P E N D E N C I E S ##################

Need to know:
	atstepstart, what's needed. potmark shit!
	atmark<blah>, what's needed

only the mark relations are interesting!
and the genquery sources, but we get that from the above. or do we? hmm.


// ################## A N A L Y S I S ##################

Want: 
	queried TURNVAR, TURNPOSVAR, UNITTURNVAR
	set TURNVAR, TURNPOSVAR, UNITTURNVAR


// ################## G A M E S   T O   A D D ##################

	Pikemen
	Nine men morris
	Mastery
	Realms
	Tablut
	Taifho
	Trespass
	Diaballik
	sombrero (http://www.di.fc.ul.pt/~jpn/gv/sombrero.htm)
