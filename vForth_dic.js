// vForth standard dictionary

export default 
function setDict(vf) {
//stack manupilation
	vf.adddict("DUP",(ds)=>{
		ds.dup() 		
	})
	vf.adddict("DROP",(ds)=>{
		ds.pop() 		
	})
	vf.adddict("SWAP",(ds)=>{
		ds.swap()
	})
	vf.adddict("OVER",(ds)=>{
		ds.over()
	})
	vf.adddict("ROT",(ds)=>{
		ds.rot()
	})
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
	vf.adddict("+",(ds)=>add(ds,1))
	vf.adddict("-",(ds)=>add(ds,-1))
	vf.adddict("++",(ds)=>{ds.push(1);add(ds,1)})
	vf.adddict("--",(ds)=>{ds.push(1);add(ds,-1)})

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
		}
		else throw new RuntimeException("type dont match")
	})
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
	})
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
	})
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
	})
	vf.adddict("MAX",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a1.type=="n" && a2.type=="n") ds.push( a2.value>a1.value?a2.value:a1.value )			
		else throw new RuntimeException("type dont match")	
	})
	vf.adddict("MIN",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a1.type=="n" && a2.type=="n") ds.push( a2.value<a1.value?a2.value:a1.value )			
		else throw new RuntimeException("type dont match")	
	})
//conditional
	vf.adddict("<",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a1.type=="n" && a2.type=="n") ds.push( a2.value < a1.value,"b" )			
		else throw new RuntimeException("type dont match")	
	})
	vf.adddict(">",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a1.type=="n" && a2.type=="n") ds.push( a2.value > a1.value,"b" )			
		else throw new RuntimeException("type dont match")	
	})
	vf.adddict("==",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a1.type=="n" && a2.type=="n") ds.push( a2.value == a1.value,"b" )
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
		else if(a1.type=="v") {
			let f = true 
			for(let i=0;i<a1.value.length;i++) {
				f = f && (a1.value[i] == 0)
			}
			ds.push(f,"b")
		}
		else throw new RuntimeException("type dont match")			
	})
	vf.adddict("!=0",(ds)=>{
		const a1 = ds.pop()
		if(a1.type=="n" ) ds.push( a1.value!=0,"b" )
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
		ds.push(!a1,"b")
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
	vf.adddict("FLOOR",(ds)=>{
		const a1 = ds.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		ds.push(Math.floor(a1.value))
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
	})
	vf.adddict("DEG",(ds)=>{
		const a1 = ds.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		ds.push(a1.value*180/Math.PI)
	})
	vf.adddict("RAD",(ds)=>{
		const a1 = ds.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		ds.push(a1.value*Math.PI/180)
	})
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
	})
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
	})
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
	})
	vf.adddict("V2",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a1.type=="n" && a2.type=="n" ) ds.push([a2.value,a1.value],"v")	
		else throw new RuntimeException("type dont match")	
	})
	vf.adddict("V3",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		const a3 = ds.pop()
		if(a1.type=="n" && a2.type=="n" && a3.type=="n") ds.push([a3.value,a2.value,a1.value],"v")
		else throw new RuntimeException("type dont match")			
	})
	vf.adddict("V4",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		const a3 = ds.pop()
		const a4 = ds.pop()
		if(a1.type=="n" && a2.type=="n" && a3.type=="n" && a4.type=="n") ds.push([a4.value,a3.value,a2.value,a1.value],"v")		
		else throw new RuntimeException("type dont match")	
	})
	vf.adddict("M2",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		if(a1.type=="v" && a2.type=="v" ) ds.push([a2.value,a1.value],"m")	
		else throw new RuntimeException("type dont match")
	})
	vf.adddict("M3",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		const a3 = ds.pop()
		if(a1.type=="v" && a2.type=="v" && a3.type=="v") ds.push([a3.value,a2.value,a1.value],"m")
		else throw new RuntimeException("type dont match")			
	})
	vf.adddict("M4",(ds)=>{
		const a1 = ds.pop() 
		const a2 = ds.pop()
		const a3 = ds.pop()
		const a4 = ds.pop()
		if(a1.type=="v" && a2.type=="v" && a3.type=="v" && a4.type=="v") ds.push([a4.value,a3.value,a2.value,a1.value],"m")		
		else throw new RuntimeException("type dont match")	
	})
	function insv(ds,ofs) {
		const n = ds.pop()
		const t = ds.pop() 
		if(n.type!="n" || t.type!="v") throw new RuntimeException("type dont match")
		t.value[ofs] = n.value
		ds.push(t.value,"v")
	}
	vf.adddict("X.",(ds)=>insv(ds,0))
	vf.adddict("Y.",(ds)=>insv(ds,1))
	vf.adddict("Z.",(ds)=>insv(ds,2))
	vf.adddict("W.",(ds)=>insv(ds,3))
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
	vf.adddict("X+",(ds)=>addv(ds,0))
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
	vf.adddict("X*",(ds)=>mulv(ds,0))
	vf.adddict("Y*",(ds)=>mulv(ds,1))
	vf.adddict("Z*",(ds)=>mulv(ds,2))
	vf.adddict("W*",(ds)=>mulv(ds,3))
	vf.alias("R*","X*")
	vf.alias("G*","Y*")
	vf.alias("B*","Z*")
	vf.alias("A*","W*")


	vf.adddict(".X",(ds)=>{
		const t = ds.top() 
		if(t.type!="v") throw new RuntimeException("type dont match")
		ds.push(t.value[0])
	})
	vf.adddict(".Y",(ds)=>{
		const t = ds.top() 
		if(t.type!="v") throw new RuntimeException("type dont match")
		ds.push(t.value[1])
	})	
	vf.adddict(".Z",(ds)=>{
		const t = ds.top() 
		if(t.type!="v" || t.value.length<3) throw new RuntimeException("type dont match")
		ds.push(t.value[2])
	})	
	vf.adddict(".W",(ds)=>{
		const t = ds.top() 
		if(t.type!="v"|| t.value.length<4) throw new RuntimeException("type dont match")
		ds.push(t.value[3])
	})
	vf.alias(".R",".X")
	vf.alias(".G",".Y")
	vf.alias(".B",".Z")
	vf.alias(".A",".W")
	vf.adddict(".XY",(ds)=>{
		const t = ds.top() 
		if(t.type!="v" || t.value.length<2) throw new RuntimeException("type dont match")
		ds.push(t.value[0])
		ds.push(t.value[1])
	})
	vf.adddict(".XYZ",(ds)=>{
		const t = ds.top() 
		if(t.type!="v" || t.value.length<3) throw new RuntimeException("type dont match")
		ds.push(t.value[0])
		ds.push(t.value[1])
		ds.push(t.value[2])
	})
	vf.adddict(".XYZW",(ds)=>{
		const t = ds.top() 
		if(t.type!="v" || t.value.length<4) throw new RuntimeException("type dont match")
		ds.push(t.value[0])
		ds.push(t.value[1])
		ds.push(t.value[2])
		ds.push(t.value[3])
	})
	vf.alias(".RG",".XY")
	vf.alias(".RGB",".XYZ")
	vf.alias(".RGBA",".XYZW")

	vf.adddict("IMAT2",(ds)=>{
		ds.push([[1,0],[0,1]],"m")	
	})
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
	})	
}