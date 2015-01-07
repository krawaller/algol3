

// ################## D A T A   T Y P E S ##################

query
	UNITS
	DEADUNITS
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

propmatcher
	ISNT(value)
	value

position
	<markname>
	OFFSET(position,direction,instruction)
	ONLYIN(query)
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
	SETUNITVARIABLE(id,value)








// ################## G A M E S   T O   A D D ##################

	Pikemen
	Amazons
	Nine men morris
	Mastery
	Realms
	Tablut
	Taifho
	Trespass
