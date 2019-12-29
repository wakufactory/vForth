// vForth

'use strict'
import setDict from "./vForth_dic.js"

//-----------------------
//typed stack class
class vStack {
	constructor() {
		this.maxstacksize = 1000
		this.stack = [] 
	}
	clear(){
		this.stack = []
	}
	get(n) {
		if(this.stack.length-1-n <0) return null 
		return this.stack[this.stack.length-1-n]
	}
	top() {
		if(this.stack.length==0 ) return null 
		const v = this.stack[this.stack.length-1]
		if(v.type=="n"||v.type=="b"||v.type=="s") return v  
		if(v.type=="v") return {type:v.type,value:v.value.slice(0)}
		if(v.type=="m") return {type:v.type,
			value: v.value.map((v)=>v.slice(0)) }
	}
	push( v ,type="n") {
		if(this.stack.length>this.maxstacksize) throw new RuntimeException("stack overflow")
		if(type=="n"||type=="b"||type=="s") this.stack.push({type:type,value:v}) 
		if(type=="v") this.stack.push( {type:type,value:v.slice(0)})
		if(type=="m") this.stack.push( {type:type,
			value: v.map((v)=>v.slice(0))
		})
	}
	pop() {
		if(this.stack.length==0)throw new RuntimeException("stack underflow") 
		return this.stack.pop()
	}
	tuck() {
		if(this.stack.length<3)throw new RuntimeException("stack underflow") 
		this.stack.push(this.top())
		const t = this.stack[this.stack.length-2]
		this.stack[this.stack.length-2] = this.stack[this.stack.length-3]
		this.stack[this.stack.length-3] = t
	}
	pick(n) {
		if(this.stack.length-n<=0) throw new RuntimeException("stack underflow")
		const v = this.stack[this.stack.length-1-n]
		this.push(v.value,v.type)
	}
	roll(n) {
		if(this.stack.length-n<=0) throw new RuntimeException("stack underflow") 
		const t =  this.stack[this.stack.length-1-n] 
		for(let i =n;i>0;i--) {
			this.stack[this.stack.length-1-i] = this.stack[this.stack.length-i]
		}
		this.stack[this.stack.length-1] = t 
	}
	dup() {
		this.pick(0)
	}
	swap() {
		this.roll(1)  
	}
	over() {
		this.pick(1)
	}
	rot() {
		this.roll(2)
	}

	dumpstack() {
		return (this.stack.slice(0)) 
	}
}// class vStack

//-----------------------
// runtime class
class vRun {
constructor() {
	this.dstack = new vStack()	
	this.localv = {}
	this.outfunc = null 
}
run(code) {
	this.emsg = "" 
	let pc = 0 ,ret 
	for(;pc<code.length;pc++) {
		let op = code[pc] 
		if(op.op==null||op.op==undefined) throw new RuntimeException("no op") 
//		console.log("op:"+op.op.name)
		//native code
		if(op.op.f) {
			try {
				ret = op.op.f(this,op.p)
			} catch(e) {
				e.op = op.op.name
				e.pc = pc 
				throw e 
				return 
			}
			if(ret!=undefined) pc += ret  
			if(pc<0 || pc >code.length) {
				throw new RuntimeException("jump over")
				return null
			}
			continue ;
		}
		//subroutine
		if(op.op.c) {
			this.run(op.op.c)
			continue 
		}
		throw new RuntimeException("invalid op")
		return null 
	}
	return this.getstack() 
}
call(code,...args) {
	args.forEach((v)=>this.pushstack(v))
	return this.run(code)
}
out(v) {
	if(this.outfunc) this.outfunc(v)
	else console.log(v)
}
getstack(n=0) {
	const s = this.dstack.get(n)
	return (s!=null)?s:null 
}
pushstack(v) {
		if((typeof v === 'number') && (isFinite(v)) ) this.dstack.push(v)
		else if(v.toString().match(/^'(.*)'$/)) this.dstack.push(v,"s")
		else if(Array.isArray(v)) {
			if(Array.isArray(v[0])) this.dstack.push(v,"m")
			else this.dstack.push(v,"v")
		}
		else if(v===true || v===false) this.dstack.push(v,"b")	
}
dumpstack() {
	return this.dstack.dumpstack() 
}
clearstack(){
	this.dstack.clear()
}
setlocal(name,v) {
	this.localv[name] = v 
}
getlocal(name) {
	if(this.localv[name]==undefined) return null
	return this.localv[name]
}
} // class vRun
class RuntimeException {
	constructor(msg) {
		this.msg = msg 
	}
}

//-----------------------
// dictionary class 
class vDictionary {
constructor() {
	this.dict = {} 	
	this.reserve = []
	this.setreserve()
}
get(name) {
	if(this.dict[name]) return this.dict[name]
	else return null 
}
adddict(name,v,desc=null) {
	for(let i=0;i<this.reserve.length;i++) if(this.reserve[i]==name) return false 
	let d
	if(Array.isArray(v)) {
		d = {name:name,c:v} 
	} else if(typeof v == "function") {
		d = {name:name,f:v}
	}
	if(desc!=null) d.desc = desc 
	this.dict[name] = d 
	return true
}
alias(alias,name,desc=null) {
	if(!this.dict[name]) return false
	const t = this.dict[name] 
	const d = {name:alias,oname:t.name}
	if(t.c) d.c = t.c 
	if(t.f) d.f = t.f 
	if(desc!=null) d.desc = desc  
	this.dict[alias] = d
}
keys() {
	return Object.keys(this.dict)
}
setreserve() {
//system
	this.adddict("$num",(rt,n)=>{
		rt.dstack.push(n) 
	},"( -- n) set numeric")
	this.adddict("$vec",(rt,n)=>{
		rt.dstack.push(n,"v")
	})
	this.adddict("$mat",(rt,n)=>{
		rt.dstack.push(n,"m")
	})
	this.adddict("$bool",(rt,n)=>{
		rt.dstack.push(n,"b")
	})
	this.adddict("$string",(rt,n)=>{
		rt.dstack.push(n,"s")
	})			
	this.adddict("$fbr",(rt,ofs)=>{
		let ret = 0 
		const a1 = rt.dstack.pop()
		if(a1.type!="b") 	new RuntimeException("type dont match")
		if(!a1.value) ret = ofs 
		return ret 
	})
	this.adddict("$tbr",(rt,ofs)=>{
		let ret = 0 
		const a1 = rt.dstack.pop()
		if(a1.type!="b") 	new RuntimeException("type dont match")
		if(a1.value) ret = ofs
		return ret  
	})
	this.adddict("$br",(rt,ofs)=>{
		return ofs 
	})
	this.adddict("NOP",(rt)=>{
	
	})
	this.adddict("!",(rt)=>{
		const n = rt.dstack.pop()
		const v = rt.dstack.pop()
		if(n.type!="a") 	new RuntimeException("type dont match")
		rt.setlocal(n.value,v)
	},"( a s -- ) store to local val")
	this.adddict("@",(rt)=>{
		const n = rt.dstack.pop()
		if(n.type!="a") 	new RuntimeException("type dont match")
		const v = rt.getlocal(n.value) 
		if(v==null) throw	new RuntimeException("no local val")
		rt.dstack.push( v.value,v.type )
	},"( s -- a ) restore from local val")

	this.reserve = Object.keys(this.dict)
}
}// class vDictionary

//-----------------------
// main class 
class vForth {
constructor() {
	this.dictionary = new vDictionary()
	setDict(this.dictionary)
	this.variables = {}
}
adddict(name,op) {
	this.dictionary.adddict(name,op)
}
getdictlist() {
	return this.dictionary.keys()
}
setVal(name,type,value) {
	this.variables[name] = {type:type,value:value}	
}
getVal(name) {
	if(this.variables[name]) return this.variables 
	else return null 
}
compile(code) {
	this.emsg = "" 
	if(typeof code == "string") code = this.parseStr(code)
	const ret = [] 
	for(let i=0;i<code.length;i++) {
		let op = code[i]
		//numeric 
		if((typeof op === 'number') && (isFinite(op)) ) {
			ret.push({op:this.dictionary.get("$num"),p:op,src:op})
			continue 
		}
		if(op.toString().match(/^'(.*)'$/)) {
			ret.push({op:this.dictionary.get("$string"),p:RegExp.$1,src:op})
			continue 			
		}
		if(Array.isArray(op)) {
			if(Array.isArray(op[0])) ret.push({op:this.dictionary["$mat"],p:op,src:op})
			else ret.push({op:this.dictionary.get("$vec"),p:op,src:op})
			continue 
		}
		if(op===true || op===false) {
			ret.push({op:this.dictionary.get("$bool"),p:op,src:op})
			continue 			
		}
		//control
		let o 
		switch(op) {
			case "IF":
				o=1 
				while(code[i+o]!="ELSE" && code[i+o]!="THEN") o++ 
				ret.push({op:this.dictionary.get("$fbr"),p:o,src:op})
				continue 
				break 
			case "ELSE":
				o=1
				while(code[i+o]!="THEN") o++
				ret.push({op:this.dictionary.get("$br"),p:o,src:op}) 
				continue 
				break 
			case "THEN":
				ret.push({op:this.dictionary.get("NOP"),src:op})
				continue 
				break 
			case "BEGIN":
				ret.push({op:this.dictionary.get("NOP"),src:op})
				continue ;
				break 
			case "UNTIL":
				o=1 
				while(code[i-o]!="BEGIN" && i-o>=0) o++ 
				ret.push({op:this.dictionary.get("$fbr"),p:-o,src:op})
				continue 
				break 
			case "REPEAT":
				o=1 
				while(code[i-o]!="BEGIN" && i-o>=0) o++ 
				ret.push({op:this.dictionary.get("$br"),p:-o,src:op})
				continue 
				break  
			case "WHILE":
				o=1 
				while(code[i+o]!="REPEAT" && i+o<code.length) o++ 
				ret.push({op:this.dictionary.get("$fbr"),p:o,src:op})
				continue 
				break 			
		}
		//operation
		let d 
		if(d = this.dictionary.get(op)) {
			ret.push({op:d,src:op})
			continue 
		} else {
			this.emsg = `compile error unkonwn op:${op} at ${i+1}`
			console.log(this.emsg)
			return null 
		}
	}
	return ret 
}
parseStr(str) {
	let vv = str.split(" ")
	let vs = [] 
	for(let i=0;i<vv.length;i++) {
		let val = vv[i].trim()
		if( val=="") continue 
		if(val.toString().match(/^'(.*)'$/)) {
			val = vv[i]
		} else {
			try {
				val = eval(val)
			}catch(e){
				 val = vv[i].trim() 
			}
		}
		vs.push( val )
	}
	return vs 
}
newRuntime() {
	return new vRun
}

} // class vForth

export {vForth,vRun,vDictionary,RuntimeException} 