// vForth standard dictionary

class RuntimeException {
	constructor(msg) {
		this.msg = msg 
	}
}
export default 
function setDict(vf) {
//stack manupilation
	vf.adddict("CLS",(ds)=>{
		ds.clear() 		
	},"( -- ) clear stack")
	vf.adddict("DUP",(ds)=>{
		ds.dup() 		
	},"( a -- a a ) duplicate")
	vf.adddict("DROP",(ds)=>{
		ds.pop() 		
	},"( a -- ) drop")
	vf.adddict("SWAP",(ds)=>{
		ds.swap()
	},"( a b -- b a ) swap")
	vf.adddict("OVER",(ds)=>{
		ds.over()
	},"( a b -- a b a ) copy over")
	vf.adddict("ROT",(ds)=>{
		ds.rot()
	},"( a b c -- b c a ) rotation")
	vf.adddict("PICK",(ds)=>{
		const n = ds.pop() 
		ds.pick(n.value)
	},"( a b n -- a b a ) pick n-th stack ")
	vf.adddict("ROLL",(ds)=>{
		const n = ds.pop() 
		ds.roll(n.value)
	},"( a b c n -- b c a) roll over n-th stack ")
	vf.adddict(".",(ds)=>{
		vf.out(ds.pop())
	})
	vf.adddict(".S",(ds)=>{
		vf.out(ds.top())
	})	

//alithmetic		
	function add(ds,m) {
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a1.type=="n" && a2.type=="n") ds.push( a2.value + m*a1.value )		
		else if(a1.type=="s" && a2.type=="s") ds.push( a2.value + a1.value,"s" )			
		else if(a2.type=="v" && a1.type=="v") {	//vector + vector 
			for(let i=0;i<a2.value.length;i++) {
				a2.value[i] += m*a1.value[i]
			}
			ds.push(a2.value,"v")
		} 
		else if(a2.type=="v" && a1.type=="n") {	//vector + scalar
			for(let i=0;i<a2.value.length;i++) {
				a2.value[i] += m*a1.value
			}
			ds.push(a2.value,"v")
		}
		else if(a2.type=="m" && a1.type=="m") {	//matrix + matrix
			const dim = a2.value.length 
			for(let r=0;r<dim;r++) {
				for(let c=0;c<dim;c++) a2.value[r][c] += m*a1.value[r][c]
			}
			ds.push(a2.value,"m")			
		} 
		else throw new RuntimeException("type dont match")
	}
	vf.adddict("+",(ds)=>add(ds,1),"( a b -- a+b ) add")
	vf.adddict("-",(ds)=>add(ds,-1),"( a b -- a-b ) substruct")
	vf.adddict("++",(ds)=>{ds.push(1);add(ds,1)},"( a -- a+1 ) incriment")
	vf.adddict("--",(ds)=>{ds.push(1);add(ds,-1)},"( a -- a-1 ) decriment")

	vf.adddict("*",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a2.type=="n" && a1.type=="n") ds.push( a2.value * a1.value )		
		else if(a2.type=="v" && a1.type=="n") {	// vector * scalar 
			for(let i=0;i<a2.value.length;i++) {
				a2.value[i] *= a1.value
			}
			ds.push(a2.value,"v")
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
			ds.push(v,"v")
		}
		else if(a2.type=="m" && a1.type=="m") {	//matrix x matrix
			if(a2.value[0].length!=a1.value[0].length) throw new RuntimeException("type dont match")
			if(a2.value.length==4) ds.push( mmult4(a2.value,a1.value),"m") 
			else throw new RuntimeException("type dont match")
		}
		else throw new RuntimeException("type dont match")
	},"( a b -- a*b ) mult")
	vf.adddict("/",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a1.type=="n" && a2.type=="n") ds.push( a2.value / a1.value )			
		else if(a1.type=="n" && a2.type=="v") {
			for(let i=0;i<a2.value.length;i++) {
				a2.value[i] /= a1.value
			}
			ds.push(a2.value,"v")
		}
		else throw new RuntimeException("type dont match")	
	},"( a b -- a/b ) devide")
	vf.adddict("1/",(ds)=>{
		const a2 = ds.pop() 
		if(a2.type=="n") ds.push( 1 / a2.value )			
		else if(a2.type=="v") {
			for(let i=0;i<a2.value.length;i++) {
				a2.value[i] /= 1
			}
			ds.push(a2.value,"v")
		}
		else throw new RuntimeException("type dont match")	
	},"( a -- 1/a ) reciprocal")
	vf.adddict("MOD",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a1.type=="n" && a2.type=="n") ds.push( a2.value % a1.value )			
		else if(a1.type=="n" && a2.type=="v") {
			for(let i=0;i<a2.value.length;i++) {
				a2.value[i] %= a1.value
			}
			ds.push(a2.value,"v")
		}
		else throw new RuntimeException("type dont match")	
	},"( a b -- a%b ) modulo")
	vf.adddict("MAX",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a1.type=="n" && a2.type=="n") ds.push( a2.value>a1.value?a2.value:a1.value )			
		else throw new RuntimeException("type dont match")	
	},"( a b -- max(a,b) ) max")
	vf.adddict("MIN",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a1.type=="n" && a2.type=="n") ds.push( a2.value<a1.value?a2.value:a1.value )			
		else throw new RuntimeException("type dont match")	
	},"( a b -- min(a,b) ) min")

//conditional
	vf.adddict("<",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a1.type=="n" && a2.type=="n") ds.push( a2.value < a1.value,"b" )		
		else if(a1.type=="s" && a2.type=="s") ds.push( a2.value < a1.value,"b" )			
		else throw new RuntimeException("type dont match")	
	},"( a b -- f ) is a < b ")
	vf.adddict(">",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a1.type=="n" && a2.type=="n") ds.push( a2.value > a1.value,"b" )		
		else if(a1.type=="s" && a2.type=="s") ds.push( a2.value > a1.value,"b" )			
		else throw new RuntimeException("type dont match")	
	})
	vf.adddict("==",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a1.type=="n" && a2.type=="n") ds.push( a2.value == a1.value,"b" )
		else if(a1.type=="s" && a2.type=="s") ds.push( a2.value == a1.value,"b" )
		else if(a1.type=="v" && a2.type=="v") {
			let f = true 
			for(let i=0;i<a2.value.length;i++) {
				f = f && (a2.value[i] == a1.value[i])
			}
			ds.push(f,"b")
		}
		else throw new RuntimeException("type dont match")			
	})
	vf.adddict("!=",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a1.type=="n" && a2.type=="n") ds.push( a2.value != a1.value,"b" )
		else if(a1.type=="s" && a2.type=="s") ds.push( a2.value != a1.value,"b" )
		else if(a1.type=="v" && a2.type=="v") {
			let f = false 
			for(let i=0;i<a2.value.length;i++) {
				if(a2.value[i] != a1.value[i]) f = true 
			}
			ds.push(f,"b")
		}
		else throw new RuntimeException("type dont match")			
	})
	vf.adddict("==0",(ds)=>{
		const a1 = ds.pop()
		if(a1.type=="n" ) ds.push( a1.value==0,"b" )
		else if(a1.type=="s" ) ds.push( a1.value=='',"b" )
		else if(a1.type=="v") {
			let f = true 
			for(let i=0;i<a1.value.length;i++) {
				f = f && (a1.value[i] == 0)
			}
			ds.push(f,"b")
		}
		else throw new RuntimeException("type dont match")			
	},"( n -- f ) is equal to zero")
	vf.adddict("!=0",(ds)=>{
		const a1 = ds.pop()
		if(a1.type=="n" ) ds.push( a1.value!=0,"b" )
		else if(a1.type=="s" ) ds.push( a1.value!='',"b" )
		else if(a1.type=="v") {
			let f = false
			for(let i=0;i<a1.value.length;i++) {
				f = f || (a1.value[i] != 0)
			}
			ds.push(f,"b")
		}
		else throw new RuntimeException("type dont match")			
	})
	vf.adddict("!",(ds)=>{
		const a1 = ds.pop() 
		if(a1.type!="b") throw new RuntimeException("type dont match")
		ds.push(!a1.value,"b")
	})
	vf.adddict("&&",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a1.type!="b" || a2.type!="b") throw new RuntimeException("type dont match")	
		ds.push( a2.value && a1.value,"b" )
	})
	vf.adddict("||",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a1.type!="b" || a2.type!="b") throw new RuntimeException("type dont match")	
		ds.push( a2.value || a1.value,"b" )
	})

//math
	vf.adddict("PI",(ds)=>{
		ds.push(Math.PI)
	})
	vf.adddict("SQRT",(ds)=>{
		const a1 = ds.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		ds.push(Math.sqrt(a1.value))
	})
	vf.adddict("^2",(ds)=>{
		const a1 = ds.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		ds.push(a1.value*a1.value)
	})
	vf.adddict("ABS",(ds)=>{
		const a1 = ds.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		ds.push(Math.abs(a1.value))
	})
	vf.adddict("SIGN",(ds)=>{
		const a1 = ds.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		ds.push(Math.sign(a1.value))
	})
	vf.adddict("FLOOR",(ds)=>{
		const a1 = ds.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		ds.push(Math.floor(a1.value))
	})
	vf.adddict("FRACT",(ds)=>{
		const a1 = ds.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		ds.push(a1.value-Math.floor(a1.value))
	})
	vf.adddict("POW",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a1.type!="n" || a2.type!="n") throw new RuntimeException("type dont match")	
		ds.push( Math.pow(a2.value,a1.value ))
	})
	vf.adddict("EXP",(ds)=>{
		const a1 = ds.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		ds.push(Math.exp(a1.value))
	})
	vf.adddict("LOG",(ds)=>{
		const a1 = ds.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		ds.push(Math.log(a1.value))
	})
	vf.adddict("LOG10",(ds)=>{
		const a1 = ds.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		ds.push(Math.log10(a1.value))
	})
	vf.adddict("SIN",(ds)=>{
		const a1 = ds.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		ds.push(Math.sin(a1.value))
	})
	vf.adddict("COS",(ds)=>{
		const a1 = ds.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		ds.push(Math.cos(a1.value))
	})
	vf.adddict("TAN",(ds)=>{
		const a1 = ds.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		ds.push(Math.tan(a1.value))
	})
	vf.adddict("ASIN",(ds)=>{
		const a1 = ds.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		ds.push(Math.asin(a1.value))
	})
	vf.adddict("ACOS",(ds)=>{
		const a1 = ds.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		ds.push(Math.acos(a1.value))
	})
	vf.adddict("ATAN2",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a1.type!="n" || a2.type!="n") throw new RuntimeException("type dont match")	
		ds.push( Math.atan2(a1.value,a2.value ))
	},"( x y -- n ) arc tan x/y ")
	vf.adddict("DEG",(ds)=>{
		const a1 = ds.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		ds.push(a1.value*180/Math.PI)
	},"( n -- n ) radian to degree")
	vf.adddict("RAD",(ds)=>{
		const a1 = ds.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		ds.push(a1.value*Math.PI/180)
	},"( n -- n ) degree to radian")
	vf.adddict("RAND",(ds)=>{
		ds.push(Math.random())
	},"( -- n ) random [0-1]")
	vf.adddict("IRAND",(ds)=>{
		const a1 = ds.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")
		ds.push(Math.floor(Math.random()*a1.value))	
	},"( n -- n ) integer random")
	vf.adddict("V2RAND",(ds)=>{
		const a1 = ds.pop()
		if(a1.type!="v"||a1.value.length!=2) throw new RuntimeException("type dont match")
		const r = Math.sin(a1.value[0]*12.9898+a1.value[1]*78.233)
                 * 43758.5453123
		ds.push(r - Math.floor(r)) 
	},"( v2 -- n ) vector2 to random")

//vector manupilation	
	vf.adddict("NORM",(ds)=>{
		const a1 = ds.pop()
		if(a1.type=="v") {
			const v = a1.value
			if(v.length==2) ds.push(Math.hypot(v[0],v[1]))
			if(v.length==3) ds.push(Math.hypot(v[0],v[1],v[2]))
			if(v.length==4) ds.push(Math.hypot(v[0],v[1],v[2],v[3]))
		}
		else throw new RuntimeException("type dont match")	
	},"( v -- n ) vector norm")
	vf.adddict("DOT",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a1.type=="v" && a2.type=="v") {
			let s = 0 
			for(let i=0;i<a2.value.length;i++) {
				s += a2.value[i] * a1.value[i]
			}
			ds.push(s)
		}
		else throw new RuntimeException("type dont match")	
	},"( v1 v2 -- n ) vector dot product")
	vf.adddict("CROSS",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a1.type=="v" && a2.type=="v") {
			let v 
			if(a1.value.length==2) {
				v = a2.value[0]*a1.value[1] - a2.value[1]*a1.value[0]
				ds.push(v)
			}
			if(a1.value.length==3) {
				v = [a2.value[1]*a1.value[2] - a2.value[2] * a1.value[1],
				a2.value[2]*a1.value[0] - a2.value[0] * a1.value[2],
				a2.value[0]*a1.value[1] - a2.value[1] * a1.value[0]] 
				ds.push(v,"v")
			}
		}
		else throw new RuntimeException("type dont match")	
	},"( v1 v2 -- v ) vector cross product")
	vf.adddict("V2",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a1.type=="n" && a2.type=="n" ) ds.push([a2.value,a1.value],"v")	
		else throw new RuntimeException("type dont match")	
	},"( n1 n2 -- v2 ) create 2dim vector")
	vf.adddict("V3",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		const a3 = ds.pop()
		if(a1.type=="n" && a2.type=="n" && a3.type=="n") ds.push([a3.value,a2.value,a1.value],"v")
		else throw new RuntimeException("type dont match")			
	},"( n1 n2 n3 -- v3 ) create 3dim vector")
	vf.adddict("V4",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a2.type=="v" && a2.value.length==3 && a1.type=="n") {
			ds.push([a2.value[0],a2.value[1],a2.value[2],a1.value],"v")
			return 
		}
		const a3 = ds.pop()
		const a4 = ds.pop()
		if(a1.type=="n" && a2.type=="n" && a3.type=="n" && a4.type=="n") ds.push([a4.value,a3.value,a2.value,a1.value],"v")		
		else throw new RuntimeException("type dont match")	
	},"( n1 n2 n3 n4 -- v4 ) or ( v3 n -- v4 ) create 4dim vector")
	vf.adddict("M2",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a1.type=="v" && a2.type=="v" ) ds.push([a2.value,a1.value],"m")	
		else throw new RuntimeException("type dont match")
	},"( v1 v2 -- m2 ) create 2x2 matrix")
	vf.adddict("M3",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		const a3 = ds.pop()
		if(a1.type=="v" && a2.type=="v" && a3.type=="v") ds.push([a3.value,a2.value,a1.value],"m")
		else throw new RuntimeException("type dont match")			
	},"( v1 v2 v3 -- m3 ) create 3x3 matrix")
	vf.adddict("M4",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		const a3 = ds.pop()
		const a4 = ds.pop()
		if(a1.type=="v" && a2.type=="v" && a3.type=="v" && a4.type=="v") ds.push([a4.value,a3.value,a2.value,a1.value],"m")		
		else throw new RuntimeException("type dont match")	
	},"( v1 v2 v3 v4 -- m4 ) create 4x4 matrix")
	function insv(ds,ofs) {
		const n = ds.pop()
		const t = ds.pop() 
		if(n.type!="n" || t.type!="v") throw new RuntimeException("type dont match")
		t.value[ofs] = n.value
		ds.push(t.value,"v")
	}
	vf.adddict("X.",(ds)=>insv(ds,0),"( v x -- v ) replace vector element")
	vf.adddict("Y.",(ds)=>insv(ds,1),"( v y -- v ) replace vector element")
	vf.adddict("Z.",(ds)=>insv(ds,2),"( v z -- v ) replace vector element")
	vf.adddict("W.",(ds)=>insv(ds,3),"( v w -- v ) replace vector element")
	vf.alias("R.","X.")
	vf.alias("G.","Y.")
	vf.alias("B.","Z.")	
	vf.alias("A.","W.")
	function addv(ds,ofs) {
		const n = ds.pop()
		const t = ds.pop() 
		if(n.type!="n" || t.type!="v") throw new RuntimeException("type dont match")
		t.value[ofs] += n.value
		ds.push(t.value,"v")
	}
	vf.adddict("X+",(ds)=>addv(ds,0),"( v x -- v ) add vector element")
	vf.adddict("Y+",(ds)=>addv(ds,1))
	vf.adddict("Z+",(ds)=>addv(ds,2))
	vf.adddict("W+",(ds)=>addv(ds,3))
	vf.alias("R+","X+")
	vf.alias("G+","Y+")
	vf.alias("B+","Z+")	
	vf.alias("A+","W+")
	function mulv(ds,ofs) {
		const n = ds.pop()
		const t = ds.pop() 
		if(n.type!="n" || t.type!="v") throw new RuntimeException("type dont match")
		t.value[ofs] *= n.value
		ds.push(t.value,"v")
	}
	vf.adddict("X*",(ds)=>mulv(ds,0),"( v x -- v ) mult vector element")
	vf.adddict("Y*",(ds)=>mulv(ds,1))
	vf.adddict("Z*",(ds)=>mulv(ds,2))
	vf.adddict("W*",(ds)=>mulv(ds,3))
	vf.alias("R*","X*")
	vf.alias("G*","Y*")
	vf.alias("B*","Z*")
	vf.alias("A*","W*")

	vf.adddict(".X",(ds)=>{
		const t = ds.pop() 
		if(t.type!="v") throw new RuntimeException("type dont match")
		ds.push(t.value[0])
	},"( v -- x ) take out vector element")
	vf.adddict(".Y",(ds)=>{
		const t = ds.pop() 
		if(t.type!="v") throw new RuntimeException("type dont match")
		ds.push(t.value[1])
	},"( v -- y ) take out vector element")	
	vf.adddict(".Z",(ds)=>{
		const t = ds.pop() 
		if(t.type!="v" || t.value.length<3) throw new RuntimeException("type dont match")
		ds.push(t.value[2])
	},"( v -- z ) take out vector element")	
	vf.adddict(".W",(ds)=>{
		const t = ds.pop() 
		if(t.type!="v"|| t.value.length<4) throw new RuntimeException("type dont match")
		ds.push(t.value[3])
	},"( v -- w ) take out vector element")
	vf.alias(".R",".X")
	vf.alias(".G",".Y")
	vf.alias(".B",".Z")
	vf.alias(".A",".W")
	vf.adddict(".XY",(ds)=>{
		const t = ds.pop() 
		if(t.type!="v" || t.value.length<2) throw new RuntimeException("type dont match")
		ds.push(t.value[0])
		ds.push(t.value[1])
	},"( v2 -- x y ) separate vector")
	vf.adddict(".XYZ",(ds)=>{
		const t = ds.pop() 
		if(t.type!="v" || t.value.length<3) throw new RuntimeException("type dont match")
		ds.push(t.value[0])
		ds.push(t.value[1])
		ds.push(t.value[2])
	},"( v3 -- x y z ) separate vector")
	vf.adddict(".XYZW",(ds)=>{
		const t = ds.pop() 
		if(t.type!="v" || t.value.length<4) throw new RuntimeException("type dont match")
		ds.push(t.value[0])
		ds.push(t.value[1])
		ds.push(t.value[2])
		ds.push(t.value[3])
	},"( v4 -- x y z w ) separate vector")
	vf.alias(".RG",".XY")
	vf.alias(".RGB",".XYZ")
	vf.alias(".RGBA",".XYZW")
	vf.adddict("UVEC2X",(ds)=>ds.push([1,0],"v"),"( -- v2 ) create 2dim unit vector X")
	vf.adddict("UVEC2Y",(ds)=>ds.push([0,1],"v"),"( -- v2 ) create 2dim unit vector Y")
	vf.adddict("UVEC3X",(ds)=>ds.push([1,0,0],"v"),"( -- v3 ) create 3dim unit vector X")
	vf.adddict("UVEC3Y",(ds)=>ds.push([0,1,0],"v"),"( -- v3 ) create 3dim unit vector Y")
	vf.adddict("UVEC3Z",(ds)=>ds.push([0,0,0,1],"v"),"( -- v3 ) create 3dim unit vector Z")
	vf.adddict("UVEC4W",(ds)=>ds.push([0,0,0,1],"v"),"( -- v4 ) create 4dim unit vector W")
	vf.adddict("ZVEC2",(ds)=>ds.push([0,0],"v"),"( -- v ) create zero vector")
	vf.adddict("ZVEC3",(ds)=>ds.push([0,0,0],"v"))
	vf.adddict("ZVEC4",(ds)=>ds.push([0,0,0,0],"v"))
	vf.adddict("IMAT2",(ds)=>{
		ds.push([[1,0],[0,1]],"m")	
	},"( -- m2 ) create identity matrix")
	vf.adddict("IMAT3",(ds)=>{
		ds.push([[1,0,0],[0,1,0],[0,0,1]],"m")	
	})
	vf.adddict("IMAT4",(ds)=>{
		ds.push([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]],"m")	
	})
	vf.adddict(".ROW",(ds)=>{
		const n = ds.pop() 
		const t = ds.top() 
		if(t.type!="m" || n.type!="n") throw new RuntimeException("type dont match")
		ds.push(t.value[n.value],"v")
	},"( m -- v ) take out vector from matrix")
//transform matrix
	vf.adddict("TRANSL",(ds)=>{	//(v3 -- m4)
		const v = ds.pop() 
		if(v.type!="v" || v.value.length!=3) throw new RuntimeException("type dont match")
		ds.push([[1,0,0,0],[0,1,0,0],[0,0,1,0],[v.value[0],v.value[1],v.value[2],1]],"m")
	},"( v3 -- m4 ) create translate matrix")
	vf.adddict("SCALE",(ds)=>{//(v3 -- m4)
		const v = ds.pop() 
		if(v.type!="v" || v.value.length!=3) throw new RuntimeException("type dont match")
		ds.push([[v.value[0],0,0,0],[0,v.value[1],0,0],[0,0,v.value[2],0],[0,0,0,1]],"m")		
	},"( v3 -- m4 ) create scale matrix")
	vf.adddict("ROTX",(ds)=>{	//(n -- m4)
		const n = ds.pop() 
		if(n.type!="n") throw new RuntimeException("type dont match")
		const ang = n.value / 2
		const sinA = Math.sin(ang)
		const cosA = Math.cos(ang)
		const sinA2 = sinA * sinA
		const rm = [[1,0,0,0],[0,1-2*sinA2,2*sinA*cosA,0],[0,-2*sinA*cosA,1-2*sinA2,0],[0,0,0,1]]
		ds.push( rm,"m")
	},"( n -- m4 ) create X rotation matrix")
	vf.adddict("ROTY",(ds)=>{	//(n -- m4)
		const n = ds.pop() 
		if(n.type!="n") throw new RuntimeException("type dont match")
		const ang = n.value / 2
		const sinA = Math.sin(ang)
		const cosA = Math.cos(ang)
		const sinA2 = sinA * sinA
		const rm = [[1-2*sinA2,0,-2*sinA*cosA,0],[0,1,0,0],[2*sinA*cosA,0,1-2*sinA2,0],[0,0,0,1]]
		ds.push( rm,"m")
	})
	vf.adddict("ROTZ",(ds)=>{	//(n -- m4)
		const n = ds.pop() 
		if(n.type!="n") throw new RuntimeException("type dont match")
		const ang = n.value / 2
		const sinA = Math.sin(ang)
		const cosA = Math.cos(ang)
		const sinA2 = sinA * sinA
		const rm = [[1-2*sinA2,2*sinA*cosA,0,0],[-2*sinA*cosA,1-2*sinA2,0,0],[0,0,1,0],[0,0,0,1]]
		ds.push( rm,"m")
	})
	vf.adddict("Q2M",(ds)=>{//(v4 -- m4)
		const v = ds.pop()
		if(v.type!="v" || v.value.length!=4) throw new RuntimeException("type dont match")
		const x = v.value[0],y=v.value[1],z=v.value[2],w=v.value[3]
		const x2 = x*x, y2=y*y, z2=z*z
		ds.push([[1- 2*(y2 + z2) ,2*(x*y + w*z),2*(x*z - w*y),0],
		[2*(x*y - w*z) ,1-2*(x2 + z2),2*(y*z + w*x),0],
		[2*(x*z + w*y) , 2*(y*z - w*x) , 1-2*(x2 + y2),0],[0,0,0,1]],"m")
	},"( v4 -- m4 ) convert Quaternion to matrix")
	vf.adddict("HSV2RGB",(ds)=>{//(v3 -- v3)
		const v = ds.pop()
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
		ds.push( [rr,gg,bb],"v")
	},"( v3 -- v3 ) HSV to RGB ")

//string
	vf.adddict("TOSTR",(ds)=>{
		const s = ds.pop() 
		ds.push(s.value.toString(),"s")
	},"( n -- s ) convert to string")
	vf.adddict("TONUM",(ds)=>{
		const s = ds.pop() 
		if(s.type=="b") ds.push(s.value?1:0)
		else ds.push(parseFloat(s.value),"n")
	},"( s -- n ) convert string to number")
	vf.adddict("STRLEN",(ds)=>{
		const s = ds.pop() 
		if(s.type!="s") throw new RuntimeException("type dont match")
		ds.push(s.value.length,"n")
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