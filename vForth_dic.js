// vForth standard dictionary

class RuntimeException {
	constructor(msg) {
		this.msg = msg 
	}
}
export default 
function setDict(vf) {
//stack manupilation
	vf.adddict("CLS",(rt)=>{
		rt.dstack.clear() 		
	},"( -- ) clear stack")
	vf.adddict("DUP",(rt)=>{
		rt.dstack.dup() 		
	},"( a -- a a ) duplicate")
	vf.adddict("DROP",(rt)=>{
		rt.dstack.pop() 		
	},"( a -- ) drop")
	vf.adddict("SWAP",(rt)=>{
		rt.dstack.swap()
	},"( a b -- b a ) swap")
	vf.adddict("OVER",(rt)=>{
		rt.dstack.over()
	},"( a b -- a b a ) copy over")
	vf.adddict("ROT",(rt)=>{
		rt.dstack.rot()
	},"( a b c -- b c a ) rotation")
	vf.adddict("PICK",(rt)=>{
		const n = rt.dstack.pop() 
		rt.dstack.pick(n.value)
	},"( a b n -- a b a ) pick n-th stack ")
	vf.adddict("ROLL",(rt)=>{
		const n = rt.dstack.pop() 
		rt.dstack.roll(n.value)
	},"( a b c n -- b c a) roll over n-th stack ")
	vf.adddict(".",(rt)=>{
		vf.out(rt.dstack.pop())
	})
	vf.adddict(".S",(rt)=>{
		vf.out(rt.dstack.top())
	})	

//alithmetic		
	function add(rt,m) {
		const a1 = rt.dstack.pop() 
		const a2 = rt.dstack.pop()
		if(a1.type=="n" && a2.type=="n") rt.dstack.push( a2.value + m*a1.value )		
		else if(a1.type=="s" && a2.type=="s") rt.dstack.push( a2.value + a1.value,"s" )			
		else if(a2.type=="v" && a1.type=="v") {	//vector + vector 
			for(let i=0;i<a2.value.length;i++) {
				a2.value[i] += m*a1.value[i]
			}
			rt.dstack.push(a2.value,"v")
		} 
		else if(a2.type=="v" && a1.type=="n") {	//vector + scalar
			for(let i=0;i<a2.value.length;i++) {
				a2.value[i] += m*a1.value
			}
			rt.dstack.push(a2.value,"v")
		}
		else if(a2.type=="m" && a1.type=="m") {	//matrix + matrix
			const dim = a2.value.length 
			for(let r=0;r<dim;r++) {
				for(let c=0;c<dim;c++) a2.value[r][c] += m*a1.value[r][c]
			}
			rt.dstack.push(a2.value,"m")			
		} 
		else throw new RuntimeException("type dont match")
	}
	vf.adddict("+",(rt)=>add(rt,1),"( a b -- a+b ) add")
	vf.adddict("-",(rt)=>add(rt,-1),"( a b -- a-b ) substruct")
	vf.adddict("++",(rt)=>{rt.dstack.push(1);add(rt,1)},"( a -- a+1 ) incriment")
	vf.adddict("--",(rt)=>{rt.dstack.push(1);add(rt,-1)},"( a -- a-1 ) decriment")

	vf.adddict("*",(rt)=>{
		const a1 = rt.dstack.pop() 
		const a2 = rt.dstack.pop()
		if(a2.type=="n" && a1.type=="n") rt.dstack.push( a2.value * a1.value )		
		else if(a2.type=="v" && a1.type=="n") {	// vector * scalar 
			for(let i=0;i<a2.value.length;i++) {
				a2.value[i] *= a1.value
			}
			rt.dstack.push(a2.value,"v")
		}
		else if(a2.type=="m" && a1.type=="v") {	//matrix x vector
			if(a2.value.length==4 && a1.value.length==3) a1.value.push(1)
			if(a2.value[0].length!=a1.value.length) throw new RuntimeException("type dont match")
			let v =[] 
			const m = a2.value 
			const dim = a2.value.length 
			for(let r=0;r<dim;r++) {
				v[r] = 0 
				for(let c=0;c<dim;c++) v[r] += m[r][c]*a1.value[c] 
			}
			rt.dstack.push(v,"v")
		}
		else if(a2.type=="m" && a1.type=="m") {	//matrix x matrix
			if(a2.value[0].length!=a1.value[0].length) throw new RuntimeException("type dont match")
			if(a2.value.length==4) rt.dstack.push( mmult4(a2.value,a1.value),"m") 
			else throw new RuntimeException("type dont match")
		}
		else throw new RuntimeException("type dont match")
	},"( a b -- a*b ) mult")
	vf.adddict("/",(rt)=>{
		const a1 = rt.dstack.pop() 
		const a2 = rt.dstack.pop()
		if(a1.type=="n" && a2.type=="n") rt.dstack.push( a2.value / a1.value )			
		else if(a1.type=="n" && a2.type=="v") {
			for(let i=0;i<a2.value.length;i++) {
				a2.value[i] /= a1.value
			}
			rt.dstack.push(a2.value,"v")
		}
		else throw new RuntimeException("type dont match")	
	},"( a b -- a/b ) devide")
	vf.adddict("1/",(rt)=>{
		const a2 = rt.dstack.pop() 
		if(a2.type=="n") rt.dstack.push( 1 / a2.value )			
		else if(a2.type=="v") {
			for(let i=0;i<a2.value.length;i++) {
				a2.value[i] /= 1
			}
			rt.dstack.push(a2.value,"v")
		}
		else throw new RuntimeException("type dont match")	
	},"( a -- 1/a ) reciprocal")
	vf.adddict("MOD",(rt)=>{
		const a1 = rt.dstack.pop() 
		const a2 = rt.dstack.pop()
		if(a1.type=="n" && a2.type=="n") rt.dstack.push( a2.value % a1.value )			
		else if(a1.type=="n" && a2.type=="v") {
			for(let i=0;i<a2.value.length;i++) {
				a2.value[i] %= a1.value
			}
			rt.dstack.push(a2.value,"v")
		}
		else throw new RuntimeException("type dont match")	
	},"( a b -- a%b ) modulo")
	vf.adddict("MAX",(rt)=>{
		const a1 = rt.dstack.pop() 
		const a2 = rt.dstack.pop()
		if(a1.type=="n" && a2.type=="n") rt.dstack.push( a2.value>a1.value?a2.value:a1.value )			
		else throw new RuntimeException("type dont match")	
	},"( a b -- max(a,b) ) max")
	vf.adddict("MIN",(rt)=>{
		const a1 = rt.dstack.pop() 
		const a2 = rt.dstack.pop()
		if(a1.type=="n" && a2.type=="n") rt.dstack.push( a2.value<a1.value?a2.value:a1.value )			
		else throw new RuntimeException("type dont match")	
	},"( a b -- min(a,b) ) min")
	vf.adddict("?:",(rt)=>{
		const a1 = rt.dstack.pop() 
		const a2 = rt.dstack.pop()
		const c = rt.dstack.pop()
		if(c.type!="b") throw new RuntimeException("type dont match")
		rt.dstack.push( c.value?a2.value:a1.value )	
	},"( c a b -- n ) c ? a : b")

//conditional
	vf.adddict("<",(rt)=>{
		const a1 = rt.dstack.pop() 
		const a2 = rt.dstack.pop()
		if(a1.type=="n" && a2.type=="n"||a1.type=="s" && a2.type=="s")
			rt.dstack.push( a2.value < a1.value,"b" )			
		else throw new RuntimeException("type dont match")	
	},"( a b -- f ) is a < b ")
	vf.adddict("<=",(rt)=>{
		const a1 = rt.dstack.pop() 
		const a2 = rt.dstack.pop()
		if(a1.type=="n" && a2.type=="n"||a1.type=="s" && a2.type=="s")
			rt.dstack.push( a2.value <= a1.value,"b" )			
		else throw new RuntimeException("type dont match")	
	},"( a b -- f ) is a <= b ")
	vf.adddict(">",(rt)=>{
		const a1 = rt.dstack.pop() 
		const a2 = rt.dstack.pop()
		if(a1.type=="n" && a2.type=="n"||a1.type=="s" && a2.type=="s")
			rt.dstack.push( a2.value > a1.value,"b" )		
		else throw new RuntimeException("type dont match")	
	})
	vf.adddict(">=",(rt)=>{
		const a1 = rt.dstack.pop() 
		const a2 = rt.dstack.pop()
		if(a1.type=="n" && a2.type=="n"||a1.type=="s" && a2.type=="s")
			rt.dstack.push( a2.value >= a1.value,"b" )		
		else throw new RuntimeException("type dont match")	
	})
	vf.adddict("==",(rt)=>{
		const a1 = rt.dstack.pop() 
		const a2 = rt.dstack.pop()
		if(a1.type=="n" && a2.type=="n") rt.dstack.push( a2.value == a1.value,"b" )
		else if(a1.type=="s" && a2.type=="s") rt.dstack.push( a2.value == a1.value,"b" )
		else if(a1.type=="v" && a2.type=="v") {
			let f = true 
			for(let i=0;i<a2.value.length;i++) {
				f = f && (a2.value[i] == a1.value[i])
			}
			rt.dstack.push(f,"b")
		}
		else throw new RuntimeException("type dont match")			
	})
	vf.adddict("!=",(rt)=>{
		const a1 = rt.dstack.pop() 
		const a2 = rt.dstack.pop()
		if(a1.type=="n" && a2.type=="n") rt.dstack.push( a2.value != a1.value,"b" )
		else if(a1.type=="s" && a2.type=="s") rt.dstack.push( a2.value != a1.value,"b" )
		else if(a1.type=="v" && a2.type=="v") {
			let f = false 
			for(let i=0;i<a2.value.length;i++) {
				if(a2.value[i] != a1.value[i]) f = true 
			}
			rt.dstack.push(f,"b")
		}
		else throw new RuntimeException("type dont match")			
	})
	vf.adddict("==0",(rt)=>{
		const a1 = rt.dstack.pop()
		if(a1.type=="n" ) rt.dstack.push( a1.value==0,"b" )
		else if(a1.type=="s" ) rt.dstack.push( a1.value=='',"b" )
		else if(a1.type=="v") {
			let f = true 
			for(let i=0;i<a1.value.length;i++) {
				f = f && (a1.value[i] == 0)
			}
			rt.dstack.push(f,"b")
		}
		else throw new RuntimeException("type dont match")			
	},"( n -- f ) is equal to zero")
	vf.adddict("!=0",(rt)=>{
		const a1 = rt.dstack.pop()
		if(a1.type=="n" ) rt.dstack.push( a1.value!=0,"b" )
		else if(a1.type=="s" ) rt.dstack.push( a1.value!='',"b" )
		else if(a1.type=="v") {
			let f = false
			for(let i=0;i<a1.value.length;i++) {
				f = f || (a1.value[i] != 0)
			}
			rt.dstack.push(f,"b")
		}
		else throw new RuntimeException("type dont match")			
	})
	vf.adddict("NOT",(rt)=>{
		const a1 = rt.dstack.pop() 
		if(a1.type!="b") throw new RuntimeException("type dont match")
		rt.dstack.push(!a1.value,"b")
	})
	vf.adddict("AND",(rt)=>{
		const a1 = rt.dstack.pop() 
		const a2 = rt.dstack.pop()
		if(a1.type!="b" || a2.type!="b") throw new RuntimeException("type dont match")	
		rt.dstack.push( a2.value && a1.value,"b" )
	})
	vf.adddict("OR",(rt)=>{
		const a1 = rt.dstack.pop() 
		const a2 = rt.dstack.pop()
		if(a1.type!="b" || a2.type!="b") throw new RuntimeException("type dont match")	
		rt.dstack.push( a2.value || a1.value,"b" )
	})

//math
	vf.adddict("PI",(rt)=>{
		rt.dstack.push(Math.PI)
	})
	vf.adddict("SQRT",(rt)=>{
		const a1 = rt.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		rt.dstack.push(Math.sqrt(a1.value))
	})
	vf.adddict("^2",(rt)=>{
		const a1 = rt.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		rt.dstack.push(a1.value*a1.value)
	})
	vf.adddict("ABS",(rt)=>{
		const a1 = rt.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		rt.dstack.push(Math.abs(a1.value))
	})
	vf.adddict("SIGN",(rt)=>{
		const a1 = rt.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		rt.dstack.push(Math.sign(a1.value))
	})
	vf.adddict("NEG",(rt)=>{
		const a1 = rt.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		rt.dstack.push(-a1.value)
	})
	vf.adddict("FLOOR",(rt)=>{
		const a1 = rt.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		rt.dstack.push(Math.floor(a1.value))
	})
	vf.adddict("FRACT",(rt)=>{
		const a1 = rt.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		rt.dstack.push(a1.value-Math.floor(a1.value))
	})
	vf.adddict("POW",(rt)=>{
		const a1 = rt.dstack.pop() 
		const a2 = rt.dstack.pop()
		if(a1.type!="n" || a2.type!="n") throw new RuntimeException("type dont match")	
		rt.dstack.push( Math.pow(a2.value,a1.value ))
	})
	vf.adddict("EXP",(rt)=>{
		const a1 = rt.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		rt.dstack.push(Math.exp(a1.value))
	})
	vf.adddict("LOG",(rt)=>{
		const a1 = rt.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		rt.dstack.push(Math.log(a1.value))
	})
	vf.adddict("LOG10",(rt)=>{
		const a1 = rt.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		rt.dstack.push(Math.log10(a1.value))
	})
	vf.adddict("SIN",(rt)=>{
		const a1 = rt.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		rt.dstack.push(Math.sin(a1.value))
	})
	vf.adddict("COS",(rt)=>{
		const a1 = rt.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		rt.dstack.push(Math.cos(a1.value))
	})
	vf.adddict("TAN",(rt)=>{
		const a1 = rt.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		rt.dstack.push(Math.tan(a1.value))
	})
	vf.adddict("ASIN",(rt)=>{
		const a1 = rt.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		rt.dstack.push(Math.asin(a1.value))
	})
	vf.adddict("ACOS",(rt)=>{
		const a1 = rt.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		rt.dstack.push(Math.acos(a1.value))
	})
	vf.adddict("ATAN2",(rt)=>{
		const a1 = rt.dstack.pop() 
		const a2 = rt.dstack.pop()
		if(a1.type!="n" || a2.type!="n") throw new RuntimeException("type dont match")	
		rt.dstack.push( Math.atan2(a1.value,a2.value ))
	},"( x y -- n ) arc tan x/y ")
	vf.adddict("DEG",(rt)=>{
		const a1 = rt.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		rt.dstack.push(a1.value*180/Math.PI)
	},"( n -- n ) radian to degree")
	vf.adddict("RAD",(rt)=>{
		const a1 = rt.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		rt.dstack.push(a1.value*Math.PI/180)
	},"( n -- n ) degree to radian")
	vf.adddict("RAND",(rt)=>{
		rt.dstack.push(Math.random())
	},"( -- n ) random [0-1]")
	vf.adddict("IRAND",(rt)=>{
		const a1 = rt.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")
		rt.dstack.push(Math.floor(Math.random()*a1.value))	
	},"( n -- n ) integer random")
	vf.adddict("V2RAND",(rt)=>{
		const a1 = rt.dstack.pop()
		if(a1.type!="v"||a1.value.length!=2) throw new RuntimeException("type dont match")
		const r = Math.sin(a1.value[0]*12.9898+a1.value[1]*78.233)
                 * 43758.5453123
		rt.dstack.push(r - Math.floor(r)) 
	},"( v2 -- n ) vector2 to random")

//vector manupilation	
	vf.adddict("NORM",(rt)=>{
		const a1 = rt.dstack.pop()
		if(a1.type=="v") {
			const v = a1.value
			if(v.length==2) rt.dstack.push(Math.hypot(v[0],v[1]))
			if(v.length==3) rt.dstack.push(Math.hypot(v[0],v[1],v[2]))
			if(v.length==4) rt.dstack.push(Math.hypot(v[0],v[1],v[2],v[3]))
		}
		else throw new RuntimeException("type dont match")	
	},"( v -- n ) vector norm")
	vf.adddict("DOT",(rt)=>{
		const a1 = rt.dstack.pop() 
		const a2 = rt.dstack.pop()
		if(a1.type=="v" && a2.type=="v") {
			let s = 0 
			for(let i=0;i<a2.value.length;i++) {
				s += a2.value[i] * a1.value[i]
			}
			rt.dstack.push(s)
		}
		else throw new RuntimeException("type dont match")	
	},"( v1 v2 -- n ) vector dot product")
	vf.adddict("CROSS",(rt)=>{
		const a1 = rt.dstack.pop() 
		const a2 = rt.dstack.pop()
		if(a1.type=="v" && a2.type=="v") {
			let v 
			if(a1.value.length==2) {
				v = a2.value[0]*a1.value[1] - a2.value[1]*a1.value[0]
				rt.dstack.push(v)
			}
			if(a1.value.length==3) {
				v = [a2.value[1]*a1.value[2] - a2.value[2] * a1.value[1],
				a2.value[2]*a1.value[0] - a2.value[0] * a1.value[2],
				a2.value[0]*a1.value[1] - a2.value[1] * a1.value[0]] 
				rt.dstack.push(v,"v")
			}
		}
		else throw new RuntimeException("type dont match")	
	},"( v1 v2 -- v ) vector cross product")
	vf.adddict("V2",(rt)=>{
		const a1 = rt.dstack.pop() 
		const a2 = rt.dstack.pop()
		if(a1.type=="n" && a2.type=="n" ) rt.dstack.push([a2.value,a1.value],"v")	
		else throw new RuntimeException("type dont match")	
	},"( n1 n2 -- v2 ) create 2dim vector")
	vf.adddict("V3",(rt)=>{
		const a1 = rt.dstack.pop() 
		const a2 = rt.dstack.pop()
		const a3 = rt.dstack.pop()
		if(a1.type=="n" && a2.type=="n" && a3.type=="n") rt.dstack.push([a3.value,a2.value,a1.value],"v")
		else throw new RuntimeException("type dont match")			
	},"( n1 n2 n3 -- v3 ) create 3dim vector")
	vf.adddict("V4",(rt)=>{
		const a1 = rt.dstack.pop() 
		const a2 = rt.dstack.pop()
		if(a2.type=="v" && a2.value.length==3 && a1.type=="n") {
			rt.dstack.push([a2.value[0],a2.value[1],a2.value[2],a1.value],"v")
			return 
		}
		const a3 = rt.dstack.pop()
		const a4 = rt.dstack.pop()
		if(a1.type=="n" && a2.type=="n" && a3.type=="n" && a4.type=="n") rt.dstack.push([a4.value,a3.value,a2.value,a1.value],"v")		
		else throw new RuntimeException("type dont match")	
	},"( n1 n2 n3 n4 -- v4 ) or ( v3 n -- v4 ) create 4dim vector")
	vf.adddict("M2",(rt)=>{
		const a1 = rt.dstack.pop() 
		const a2 = rt.dstack.pop()
		if(a1.type=="v" && a2.type=="v" ) rt.dstack.push([a2.value,a1.value],"m")	
		else throw new RuntimeException("type dont match")
	},"( v1 v2 -- m2 ) create 2x2 matrix")
	vf.adddict("M3",(rt)=>{
		const a1 = rt.dstack.pop() 
		const a2 = rt.dstack.pop()
		const a3 = rt.dstack.pop()
		if(a1.type=="v" && a2.type=="v" && a3.type=="v") rt.dstack.push([a3.value,a2.value,a1.value],"m")
		else throw new RuntimeException("type dont match")			
	},"( v1 v2 v3 -- m3 ) create 3x3 matrix")
	vf.adddict("M4",(rt)=>{
		const a1 = rt.dstack.pop() 
		const a2 = rt.dstack.pop()
		const a3 = rt.dstack.pop()
		const a4 = rt.dstack.pop()
		if(a1.type=="v" && a2.type=="v" && a3.type=="v" && a4.type=="v") rt.dstack.push([a4.value,a3.value,a2.value,a1.value],"m")		
		else throw new RuntimeException("type dont match")	
	},"( v1 v2 v3 v4 -- m4 ) create 4x4 matrix")
	function insv(rt,ofs) {
		const n = rt.dstack.pop()
		const t = rt.dstack.pop() 
		if(n.type!="n" || t.type!="v") throw new RuntimeException("type dont match")
		t.value[ofs] = n.value
		rt.dstack.push(t.value,"v")
	}
	vf.adddict("X.",(rt)=>insv(rt,0),"( v x -- v ) replace vector element")
	vf.adddict("Y.",(rt)=>insv(rt,1),"( v y -- v ) replace vector element")
	vf.adddict("Z.",(rt)=>insv(rt,2),"( v z -- v ) replace vector element")
	vf.adddict("W.",(rt)=>insv(rt,3),"( v w -- v ) replace vector element")
	vf.alias("R.","X.")
	vf.alias("G.","Y.")
	vf.alias("B.","Z.")	
	vf.alias("A.","W.")
	function addv(rt,ofs) {
		const n = rt.dstack.pop()
		const t = rt.dstack.pop() 
		if(n.type!="n" || t.type!="v") throw new RuntimeException("type dont match")
		t.value[ofs] += n.value
		rt.dstack.push(t.value,"v")
	}
	vf.adddict("X+",(rt)=>addv(rt,0),"( v x -- v ) add vector element")
	vf.adddict("Y+",(rt)=>addv(rt,1))
	vf.adddict("Z+",(rt)=>addv(rt,2))
	vf.adddict("W+",(rt)=>addv(rt,3))
	vf.alias("R+","X+")
	vf.alias("G+","Y+")
	vf.alias("B+","Z+")	
	vf.alias("A+","W+")
	function mulv(rt,ofs) {
		const n = rt.dstack.pop()
		const t = rt.dstack.pop() 
		if(n.type!="n" || t.type!="v") throw new RuntimeException("type dont match")
		t.value[ofs] *= n.value
		rt.dstack.push(t.value,"v")
	}
	vf.adddict("X*",(rt)=>mulv(rt,0),"( v x -- v ) mult vector element")
	vf.adddict("Y*",(rt)=>mulv(rt,1))
	vf.adddict("Z*",(rt)=>mulv(rt,2))
	vf.adddict("W*",(rt)=>mulv(rt,3))
	vf.alias("R*","X*")
	vf.alias("G*","Y*")
	vf.alias("B*","Z*")
	vf.alias("A*","W*")

	vf.adddict(".X",(rt)=>{
		const t = rt.dstack.pop() 
		if(t.type!="v") throw new RuntimeException("type dont match")
		rt.dstack.push(t.value[0])
	},"( v -- x ) take out vector element")
	vf.adddict(".Y",(rt)=>{
		const t = rt.dstack.pop() 
		if(t.type!="v") throw new RuntimeException("type dont match")
		rt.dstack.push(t.value[1])
	},"( v -- y ) take out vector element")	
	vf.adddict(".Z",(rt)=>{
		const t = rt.dstack.pop() 
		if(t.type!="v" || t.value.length<3) throw new RuntimeException("type dont match")
		rt.dstack.push(t.value[2])
	},"( v -- z ) take out vector element")	
	vf.adddict(".W",(rt)=>{
		const t = rt.dstack.pop() 
		if(t.type!="v"|| t.value.length<4) throw new RuntimeException("type dont match")
		rt.dstack.push(t.value[3])
	},"( v -- w ) take out vector element")
	vf.alias(".R",".X")
	vf.alias(".G",".Y")
	vf.alias(".B",".Z")
	vf.alias(".A",".W")
	vf.adddict(".XY",(rt)=>{
		const t = rt.dstack.pop() 
		if(t.type!="v" || t.value.length<2) throw new RuntimeException("type dont match")
		rt.dstack.push(t.value[0])
		rt.dstack.push(t.value[1])
	},"( v2 -- x y ) separate vector")
	vf.adddict(".XYZ",(rt)=>{
		const t = rt.dstack.pop() 
		if(t.type!="v" || t.value.length<3) throw new RuntimeException("type dont match")
		rt.dstack.push(t.value[0])
		rt.dstack.push(t.value[1])
		rt.dstack.push(t.value[2])
	},"( v3 -- x y z ) separate vector")
	vf.adddict(".XYZW",(rt)=>{
		const t = rt.dstack.pop() 
		if(t.type!="v" || t.value.length<4) throw new RuntimeException("type dont match")
		rt.dstack.push(t.value[0])
		rt.dstack.push(t.value[1])
		rt.dstack.push(t.value[2])
		rt.dstack.push(t.value[3])
	},"( v4 -- x y z w ) separate vector")
	vf.alias(".RG",".XY")
	vf.alias(".RGB",".XYZ")
	vf.alias(".RGBA",".XYZW")
	vf.adddict("UVEC2X",(rt)=>rt.dstack.push([1,0],"v"),"( -- v2 ) create 2dim unit vector X")
	vf.adddict("UVEC2Y",(rt)=>rt.dstack.push([0,1],"v"),"( -- v2 ) create 2dim unit vector Y")
	vf.adddict("UVEC3X",(rt)=>rt.dstack.push([1,0,0],"v"),"( -- v3 ) create 3dim unit vector X")
	vf.adddict("UVEC3Y",(rt)=>rt.dstack.push([0,1,0],"v"),"( -- v3 ) create 3dim unit vector Y")
	vf.adddict("UVEC3Z",(rt)=>rt.dstack.push([0,0,0,1],"v"),"( -- v3 ) create 3dim unit vector Z")
	vf.adddict("UVEC4W",(rt)=>rt.dstack.push([0,0,0,1],"v"),"( -- v4 ) create 4dim unit vector W")
	vf.adddict("ZVEC2",(rt)=>rt.dstack.push([0,0],"v"),"( -- v ) create zero vector")
	vf.adddict("ZVEC3",(rt)=>rt.dstack.push([0,0,0],"v"))
	vf.adddict("ZVEC4",(rt)=>rt.dstack.push([0,0,0,0],"v"))
	vf.adddict("IMAT2",(rt)=>{
		rt.dstack.push([[1,0],[0,1]],"m")	
	},"( -- m2 ) create identity matrix")
	vf.adddict("IMAT3",(rt)=>{
		rt.dstack.push([[1,0,0],[0,1,0],[0,0,1]],"m")	
	})
	vf.adddict("IMAT4",(rt)=>{
		rt.dstack.push([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]],"m")	
	})
	vf.adddict(".ROW",(rt)=>{
		const n = rt.dstack.pop() 
		const t = rt.dstack.top() 
		if(t.type!="m" || n.type!="n") throw new RuntimeException("type dont match")
		rt.dstack.push(t.value[n.value],"v")
	},"( m -- v ) take out vector from matrix")
//transform matrix
	vf.adddict("TRANSL",(rt)=>{	//(v3 -- m4)
		const v = rt.dstack.pop() 
		if(v.type!="v" || v.value.length!=3) throw new RuntimeException("type dont match")
		rt.dstack.push([[1,0,0,0],[0,1,0,0],[0,0,1,0],[v.value[0],v.value[1],v.value[2],1]],"m")
	},"( v3 -- m4 ) create translate matrix")
	vf.adddict("SCALE",(rt)=>{//(v3 -- m4)
		const v = rt.dstack.pop() 
		if(v.type!="v" || v.value.length!=3) throw new RuntimeException("type dont match")
		rt.dstack.push([[v.value[0],0,0,0],[0,v.value[1],0,0],[0,0,v.value[2],0],[0,0,0,1]],"m")		
	},"( v3 -- m4 ) create scale matrix")
	vf.adddict("ROTX",(rt)=>{	//(n -- m4)
		const n = rt.dstack.pop() 
		if(n.type!="n") throw new RuntimeException("type dont match")
		const ang = n.value / 2
		const sinA = Math.sin(ang)
		const cosA = Math.cos(ang)
		const sinA2 = sinA * sinA
		const rm = [[1,0,0,0],[0,1-2*sinA2,2*sinA*cosA,0],[0,-2*sinA*cosA,1-2*sinA2,0],[0,0,0,1]]
		rt.dstack.push( rm,"m")
	},"( n -- m4 ) create X rotation matrix")
	vf.adddict("ROTY",(rt)=>{	//(n -- m4)
		const n = rt.dstack.pop() 
		if(n.type!="n") throw new RuntimeException("type dont match")
		const ang = n.value / 2
		const sinA = Math.sin(ang)
		const cosA = Math.cos(ang)
		const sinA2 = sinA * sinA
		const rm = [[1-2*sinA2,0,-2*sinA*cosA,0],[0,1,0,0],[2*sinA*cosA,0,1-2*sinA2,0],[0,0,0,1]]
		rt.dstack.push( rm,"m")
	})
	vf.adddict("ROTZ",(rt)=>{	//(n -- m4)
		const n = rt.dstack.pop() 
		if(n.type!="n") throw new RuntimeException("type dont match")
		const ang = n.value / 2
		const sinA = Math.sin(ang)
		const cosA = Math.cos(ang)
		const sinA2 = sinA * sinA
		const rm = [[1-2*sinA2,2*sinA*cosA,0,0],[-2*sinA*cosA,1-2*sinA2,0,0],[0,0,1,0],[0,0,0,1]]
		rt.dstack.push( rm,"m")
	})
	vf.adddict("Q2M",(rt)=>{//(v4 -- m4)
		const v = rt.dstack.pop()
		if(v.type!="v" || v.value.length!=4) throw new RuntimeException("type dont match")
		const x = v.value[0],y=v.value[1],z=v.value[2],w=v.value[3]
		const x2 = x*x, y2=y*y, z2=z*z
		rt.dstack.push([[1- 2*(y2 + z2) ,2*(x*y + w*z),2*(x*z - w*y),0],
		[2*(x*y - w*z) ,1-2*(x2 + z2),2*(y*z + w*x),0],
		[2*(x*z + w*y) , 2*(y*z - w*x) , 1-2*(x2 + y2),0],[0,0,0,1]],"m")
	},"( v4 -- m4 ) convert Quaternion to matrix")
	vf.adddict("HSV2RGB",(rt)=>{//(v3 -- v3)
		const v = rt.dstack.pop()
		if(v.type!="v" || v.value.length!=3) throw new RuntimeException("type dont match")
		let H = v.value[0]
		let S = v.value[1]
		let V = v.value[2]
		let ih;
		let fl;
		let m, n;
		let rr,gg,bb ;
		H = H * 6 ;
		ih = Math.floor( H );
		fl = H - ih;
		if( !(ih & 1)) fl = 1 - fl;
		m = V * ( 1 - S );
		n = V * ( 1 - S * fl );
		switch( ih ){
			case 0:
			case 6:
				rr = V; gg = n; bb = m; break;
				case 1: rr = n; gg = V; bb = m; break;
				case 2: rr = m; gg = V; bb = n; break;
				case 3: rr = m; gg = n; bb = V; break;
				case 4: rr = n; gg = m; bb = V; break;
				case 5: rr = V; gg = m; bb = n; break;
		}
		rt.dstack.push( [rr,gg,bb],"v")
	},"( v3 -- v3 ) HSV to RGB ")

//string
	vf.adddict("TOSTR",(rt)=>{
		const s = rt.dstack.pop() 
		rt.dstack.push(s.value.toString(),"s")
	},"( n -- s ) convert to string")
	vf.adddict("TONUM",(rt)=>{
		const s = rt.dstack.pop() 
		if(s.type=="b") rt.dstack.push(s.value?1:0)
		else rt.dstack.push(parseFloat(s.value),"n")
	},"( s -- n ) convert string to number")
	vf.adddict("STRLEN",(rt)=>{
		const s = rt.dstack.pop() 
		if(s.type!="s") throw new RuntimeException("type dont match")
		rt.dstack.push(s.value.length,"n")
	},"( s -- n ) string length")
}
function mmult4(m1,m2) {
	return [ 
	[ m1[0][0]*m2[0][0]+m1[0][1]*m2[1][0]+m1[0][2]*m2[2][0]+m1[0][3]*m2[3][0],
		m1[0][0]*m2[0][1]+m1[0][1]*m2[1][1]+m1[0][2]*m2[2][1]+m1[0][3]*m2[3][1],
		m1[0][0]*m2[0][2]+m1[0][1]*m2[1][2]+m1[0][2]*m2[2][2]+m1[0][3]*m2[3][2],
		m1[0][0]*m2[0][3]+m1[0][1]*m2[1][3]+m1[0][2]*m2[2][3]+m1[0][3]*m2[3][3] ],
	[ m1[1][0]*m2[0][0]+m1[1][1]*m2[1][0]+m1[1][2]*m2[2][0]+m1[1][3]*m2[3][0],
		m1[1][0]*m2[0][1]+m1[1][1]*m2[1][1]+m1[1][2]*m2[2][1]+m1[1][3]*m2[3][1],
		m1[1][0]*m2[0][2]+m1[1][1]*m2[1][2]+m1[1][2]*m2[2][2]+m1[1][3]*m2[3][2],
		m1[1][0]*m2[0][3]+m1[1][1]*m2[1][3]+m1[1][2]*m2[2][3]+m1[1][3]*m2[3][3] ],	
	[ m1[2][0]*m2[0][0]+m1[2][1]*m2[1][0]+m1[2][2]*m2[2][0]+m1[2][3]*m2[3][0],
		m1[2][0]*m2[0][1]+m1[2][1]*m2[1][1]+m1[2][2]*m2[2][1]+m1[2][3]*m2[3][1],
		m1[2][0]*m2[0][2]+m1[2][1]*m2[1][2]+m1[2][2]*m2[2][2]+m1[2][3]*m2[3][2],
		m1[2][0]*m2[0][3]+m1[2][1]*m2[1][3]+m1[2][2]*m2[2][3]+m1[2][3]*m2[3][3] ],
	[ m1[3][0]*m2[0][0]+m1[3][1]*m2[1][0]+m1[3][2]*m2[2][0]+m1[3][3]*m2[3][0],
		m1[3][0]*m2[0][1]+m1[3][1]*m2[1][1]+m1[3][2]*m2[2][1]+m1[3][3]*m2[3][1],
		m1[3][0]*m2[0][2]+m1[3][1]*m2[1][2]+m1[3][2]*m2[2][2]+m1[3][3]*m2[3][2],
		m1[3][0]*m2[0][3]+m1[3][1]*m2[1][3]+m1[3][2]*m2[2][3]+m1[3][3]*m2[3][3] ]
		]
}