// vForth

'use strict'
import setDict from "./vForth_dic.js"

class RuntimeException {
	constructor(msg) {
		this.msg = msg 
	}
}
class vStack {
	constructor() {
		this.maxstacksize = 1000
		this.stack = [] 
	}
	clear(){
		this.stack = []
	}
	top() {
		if(this.stack.length==0 ) return null 
		const v = this.stack[this.stack.length-1]
		if(v.type=="n"||v.type=="b") return v  
		if(v.type=="v") return {type:v.type,value:v.value.slice(0)}
		if(v.type=="m") return {type:v.type,
			value: v.value.map((v)=>v.slice(0)) }
	}
	push( v ,type="n") {
		if(this.stack.length>this.maxstacksize) throw new RuntimeException("stack overflow")
		if(type=="n"||type=="b") this.stack.push({type:type,value:v}) 
		if(type=="v") this.stack.push( {type:type,value:v.slice(0)})
		if(type=="m") this.stack.push( {type:type,
			value: v.map((v)=>v.slice(0))
		})
	}
	pop() {
		if(this.stack.length==0)throw new RuntimeException("stack underflow") 
		return this.stack.pop() 
	}
	dup() {
		if(this.stack.length==0) throw new RuntimeException("stack underflow")
		const v =  this.stack[this.stack.length-1]
		this.push(v.value,v.type)
	}
	swap() {
		if(this.stack.length<2) throw new RuntimeException("stack underflow") 
		const t =  this.stack[this.stack.length-1] 
		this.stack[this.stack.length-1] = this.stack[this.stack.length-2]
		this.stack[this.stack.length-2] = t   
	}
	over() {
		if(this.stack.length<2) throw new RuntimeException("stack underflow") 
		const v = this.stack[this.stack.length-2]
		this.push(v.value,v.type) 
	}
	rot() {
		if(this.stack.length<3) throw new RuntimeException("stack underflow") 
		const t =  this.stack[this.stack.length-3] 
		this.stack[this.stack.length-3] = this.stack[this.stack.length-2]
		this.stack[this.stack.length-2] = this.stack[this.stack.length-1]
		this.stack[this.stack.length-1] = t  
	}
	dumpstack() {
		return (this.stack.slice(0)) 
	}
}
class vForth {
constructor() {
	this.dstack = new vStack()
	this.dict = {} 
	this.reserve = []
	this.variables = {}
	this.setreserve()
	setDict(this)
}

adddict(name,v) {
	for(let i=0;i<this.reserve.length;i++) if(this.reserve[i]==name) return false 
	if(Array.isArray(v)) {
		const cc = this.compile(v) 
		if(!cc) return false 
		this.dict[name] = {name:name,c:cc} 
	} else if(typeof v == "function") {
		this.dict[name] = {name:name,f:v}
	}
	return true
}
alias(alias,name) {
	if(!this.dict[name]) return false 
	this.dict[alias] = this.dict[name]
}
dumpstack() {
	return this.dstack.dumpstack() 
}
dump() {
	const s = this.dstack.dumpstack()
	console.log(
		s.reduce((a,c)=>{
			let v 
			switch(c.type) {
				case "v":
					v = "["+c.value+"]"
					break
				case "m":
					v = "["+c.value.reduce((a,v)=>a+"["+v.join()+"]","")+"]"
					break
				case "n":
					v = c.value 
					break 
				case "b":
					v = "<"+c.value+">" 
					break 
				case "s":
					v = "'"+c.value+"'"
					break
			}
			return a +v+"," 
		},"stack:")
	)
}
out(data) {
	console.log(data.value) 
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
	const ret = [] 
	for(let i=0;i<code.length;i++) {
		let op = code[i]
		//numeric 
		if((typeof op === 'number') && (isFinite(op)) ) {
			ret.push({op:this.dict["$num"],p:op,src:op})
			continue 
		}
		if(op.toString().match(/^'(.*)'$/)) {
			ret.push({op:this.dict["$string"],p:RegExp.$1,src:op})
			continue 			
		}
		if(Array.isArray(op)) {
			if(Array.isArray(op[0])) ret.push({op:this.dict["$mat"],p:op,src:op})
			else ret.push({op:this.dict["$vec"],p:op,src:op})
			continue 
		}
		if(op===true || op===false) {
			ret.push({op:this.dict["$bool"],p:op,src:op})
			continue 			
		}
		//control
		let o 
		switch(op) {
			case "IF":
				o=1 
				while(code[i+o]!="ELSE" && code[i+o]!="ENDIF") o++ 
				ret.push({op:this.dict["$fbr"],p:o,src:op})
				continue 
				break 
			case "ELSE":
				o=1
				while(code[i+o]!="ENDIF") o++
				ret.push({op:this.dict["$br"],p:o,src:op}) 
				continue 
				break 
			case "ENDIF":
				ret.push({op:this.dict["NOP"],src:op})
				continue 
				break 
			case "LOOP":
				ret.push({op:this.dict["NOP"],src:op})
				continue ;
				break 
			case "ENDLOOP":
				o=1 
				while(code[i-o]!="LOOP") o++ 
				ret.push({op:this.dict["$br"],p:-o,src:op})
				continue 
				break  
			case "EXITIF":
				o=1 
				while(code[i+o]!="ENDLOOP") o++ 
				ret.push({op:this.dict["$tbr"],p:o+1,src:op})
				continue 
				break 			
		}
		//operation
		if(this.dict[op]) {
			ret.push({op:this.dict[op],src:op})
			continue 
		} else {
			this.emsg = `compile error unkonwn op:${op} at ${i+1}`
			console.log(this.emsg)
			return null 
		}
	}
	return ret 
}
run(code) {
	this.emsg = "" 
	let pc = 0 ,ret 
	for(;pc<code.length;pc++) {
		let op = code[pc] 
		if(op.op==null||op.op==undefined) throw new RuntimeException("no op") 
		this.dump()
		console.log("op:"+op.op.name)
		//native code
		if(op.op.f) {
			ret = op.op.f(op.p)

			if(ret!=undefined) pc += ret  
			if(pc<0 || pc >code.length) {
				throw new RuntimeException("jump over")
				return false
			}
			continue ;
		}
		//subroutine
		if(op.op.c) {
			this.run(op.op.c)
			continue 
		}
		throw new RuntimeException("invalid op")
		return false 
	}
	return true 
}
setreserve() {
//system
	this.adddict("$num",(n)=>{
		this.dstack.push(n) 
	})
	this.adddict("$vec",(n)=>{
		this.dstack.push(n,"v")
	})
	this.adddict("$mat",(n)=>{
		this.dstack.push(n,"m")
	})
	this.adddict("$bool",(n)=>{
		this.dstack.push(n,"b")
	})
	this.adddict("$string",(n)=>{
		this.dstack.push(n,"s")
	})			
	this.adddict("$fbr",(ofs)=>{
		let ret = 0 
		const a1 = this.dstack.pop()
		if(!a1.value) ret = ofs 
		return ret 
	})
	this.adddict("$tbr",(ofs)=>{
		let ret = 0 
		const a1 = this.dstack.pop()
		if(a1.value) ret = ofs
		return ret  
	})
	this.adddict("$br",(ofs)=>{
		return ofs 
	})
	this.adddict("NOP",()=>{
		
	})
	this.reserve = Object.keys(this.dict)
}
}

export {vForth,RuntimeException} 