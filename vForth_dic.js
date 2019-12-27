// vForth standard dictionary

export default 
function setDict(vf) {
//stack manupilation
	vf.adddict("DUP",()=>{
		vf.dstack.dup() 		
	})
	vf.adddict("DROP",()=>{
		vf.dstack.pop() 		
	})
	vf.adddict("SWAP",()=>{
		vf.dstack.swap()
	})
	vf.adddict("OVER",()=>{
		vf.dstack.over()
	})
	vf.adddict("ROT",()=>{
		vf.dstack.rot()
	})
	vf.adddict(".",()=>{
		vf.out(vf.dstack.pop())
	})
	vf.adddict(".S",()=>{
		vf.out(vf.dstack.top())
	})	

//alithmetic		
	function add(self,m) {
		const a1 = self.dstack.pop() 
		const a2 = self.dstack.pop()
		if(a1.type=="n" && a2.type=="n") self.dstack.push( a2.value + m*a1.value )		
		else if(a2.type=="v" && a1.type=="v") {	//vector + vector 
			for(let i=0;i<a2.value.length;i++) {
				a2.value[i] += m*a1.value[i]
			}
			self.dstack.push(a2.value,"v")
		} 
		else if(a2.type=="v" && a1.type=="n") {	//vector + scalar
			for(let i=0;i<a2.value.length;i++) {
				a2.value[i] += m*a1.value
			}
			self.dstack.push(a2.value,"v")
		}
		else if(a2.type=="m" && a1.type=="m") {	//matrix + matrix
			const dim = a2.value.length 
			for(let r=0;r<dim;r++) {
				for(let c=0;c<dim;c++) a2.value[r][c] += m*a1.value[r][c]
			}
			self.dstck.push(a2.value,"m")			
		} 
		else throw new RuntimeException("type dont match")
	}
	vf.adddict("+",()=>add(vf,1))
	vf.adddict("-",()=>add(vf,-1))
	vf.adddict("++",()=>{vf.dstack.push(1);add(vf,1)})
	vf.adddict("--",()=>{vf.dstack.push(1);add(vf,-1)})

	vf.adddict("*",()=>{
		const a1 = vf.dstack.pop() 
		const a2 = vf.dstack.pop()
		if(a2.type=="n" && a1.type=="n") vf.dstack.push( a2.value * a1.value )		
		else if(a2.type=="v" && a1.type=="n") {	// vector * scalar 
			for(let i=0;i<a2.value.length;i++) {
				a2.value[i] *= a1.value
			}
			vf.dstack.push(a2.value,"v")
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
			vf.dstack.push(v,"v")
		}
		else if(a2.type=="m" && a1.type=="m") {	//matrix x matrix
			if(a2.value[0].length!=a1.value[0].length) throw new RuntimeException("type dont match")
		}
		else throw new RuntimeException("type dont match")
	})
	vf.adddict("/",()=>{
		const a1 = vf.dstack.pop() 
		const a2 = vf.dstack.pop()
		if(a1.type=="n" && a2.type=="n") vf.dstack.push( a2.value / a1.value )			
		else if(a1.type=="n" && a2.type=="v") {
			for(let i=0;i<a2.value.length;i++) {
				a2.value[i] /= a1.value
			}
			vf.dstack.push(a2.value,"v")
		}
		else throw new RuntimeException("type dont match")	
	})
	vf.adddict("1/",()=>{
		const a2 = vf.dstack.pop() 
		if(a2.type=="n") vf.dstack.push( 1 / a2.value )			
		else if(a2.type=="v") {
			for(let i=0;i<a2.value.length;i++) {
				a2.value[i] /= 1
			}
			vf.dstack.push(a2.value,"v")
		}
		else throw new RuntimeException("type dont match")	
	})
	vf.adddict("MOD",()=>{
		const a1 = vf.dstack.pop() 
		const a2 = vf.dstack.pop()
		if(a1.type=="n" && a2.type=="n") vf.dstack.push( a2.value % a1.value )			
		else if(a1.type=="n" && a2.type=="v") {
			for(let i=0;i<a2.value.length;i++) {
				a2.value[i] %= a1.value
			}
			vf.dstack.push(a2.value,"v")
		}
		else throw new RuntimeException("type dont match")	
	})
	vf.adddict("MAX",()=>{
		const a1 = vf.dstack.pop() 
		const a2 = vf.dstack.pop()
		if(a1.type=="n" && a2.type=="n") vf.dstack.push( a2.value>a1.value?a2.value:a1.value )			
		else throw new RuntimeException("type dont match")	
	})
	vf.adddict("MIN",()=>{
		const a1 = vf.dstack.pop() 
		const a2 = vf.dstack.pop()
		if(a1.type=="n" && a2.type=="n") vf.dstack.push( a2.value<a1.value?a2.value:a1.value )			
		else throw new RuntimeException("type dont match")	
	})
//conditional
	vf.adddict("<",()=>{
		const a1 = vf.dstack.pop() 
		const a2 = vf.dstack.pop()
		if(a1.type=="n" && a2.type=="n") vf.dstack.push( a2.value < a1.value,"b" )			
		else throw new RuntimeException("type dont match")	
	})
	vf.adddict(">",()=>{
		const a1 = vf.dstack.pop() 
		const a2 = vf.dstack.pop()
		if(a1.type=="n" && a2.type=="n") vf.dstack.push( a2.value > a1.value,"b" )			
		else throw new RuntimeException("type dont match")	
	})
	vf.adddict("==",()=>{
		const a1 = vf.dstack.pop() 
		const a2 = vf.dstack.pop()
		if(a1.type=="n" && a2.type=="n") vf.dstack.push( a2.value == a1.value,"b" )
		else if(a1.type=="v" && a2.type=="v") {
			let f = true 
			for(let i=0;i<a2.value.length;i++) {
				f = f && (a2.value[i] == a1.value[i])
			}
			vf.dstack.push(f,"b")
		}
		else throw new RuntimeException("type dont match")			
	})
	vf.adddict("!=",()=>{
		const a1 = vf.dstack.pop() 
		const a2 = vf.dstack.pop()
		if(a1.type=="n" && a2.type=="n") vf.dstack.push( a2.value != a1.value,"b" )
		else if(a1.type=="v" && a2.type=="v") {
			let f = false 
			for(let i=0;i<a2.value.length;i++) {
				if(a2.value[i] != a1.value[i]) f = true 
			}
			vf.dstack.push(f,"b")
		}
		else throw new RuntimeException("type dont match")			
	})
	vf.adddict("==0",()=>{
		const a1 = vf.dstack.pop()
		if(a1.type=="n" ) vf.dstack.push( a1.value==0,"b" )
		else if(a1.type=="v") {
			let f = true 
			for(let i=0;i<a1.value.length;i++) {
				f = f && (a1.value[i] == 0)
			}
			vf.dstack.push(f,"b")
		}
		else throw new RuntimeException("type dont match")			
	})
	vf.adddict("!=0",()=>{
		const a1 = vf.dstack.pop()
		if(a1.type=="n" ) vf.dstack.push( a1.value!=0,"b" )
		else if(a1.type=="v") {
			let f = false
			for(let i=0;i<a1.value.length;i++) {
				f = f || (a1.value[i] != 0)
			}
			vf.dstack.push(f,"b")
		}
		else throw new RuntimeException("type dont match")			
	})
	vf.adddict("!",()=>{
		const a1 = vf.dstack.pop() 
		if(a1.type!="b") throw new RuntimeException("type dont match")
		vf.dstack.push(!a1,"b")
	})
	vf.adddict("&&",()=>{
		const a1 = vf.dstack.pop() 
		const a2 = vf.dstack.pop()
		if(a1.type!="b" || a2.type!="b") throw new RuntimeException("type dont match")	
		vf.dstack.push( a2.value && a1.value,"b" )
	})
	vf.adddict("||",()=>{
		const a1 = vf.dstack.pop() 
		const a2 = vf.dstack.pop()
		if(a1.type!="b" || a2.type!="b") throw new RuntimeException("type dont match")	
		vf.dstack.push( a2.value || a1.value,"b" )
	})

//math
	vf.adddict("PI",()=>{
		vf.dstack.push(Math.PI)
	})
	vf.adddict("SQRT",()=>{
		const a1 = vf.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		vf.dstack.push(Math.sqrt(a1.value))
	})
	vf.adddict("^2",()=>{
		const a1 = vf.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		vf.dstack.push(a1.value*a1.value)
	})
	vf.adddict("ABS",()=>{
		const a1 = vf.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		vf.dstack.push(Math.abs(a1.value))
	})
	vf.adddict("FLOOR",()=>{
		const a1 = vf.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		vf.dstack.push(Math.floor(a1.value))
	})
	vf.adddict("POW",()=>{
		const a1 = vf.dstack.pop() 
		const a2 = vf.dstack.pop()
		if(a1.type!="n" || a2.type!="n") throw new RuntimeException("type dont match")	
		vf.dstack.push( Math.pow(a2.value,a1.value ))
	})
	vf.adddict("EXP",()=>{
		const a1 = vf.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		vf.dstack.push(Math.exp(a1.value))
	})
	vf.adddict("LOG",()=>{
		const a1 = vf.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		vf.dstack.push(Math.log(a1.value))
	})
	vf.adddict("LOG10",()=>{
		const a1 = vf.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		vf.dstack.push(Math.log10(a1.value))
	})
	vf.adddict("SIN",()=>{
		const a1 = vf.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		vf.dstack.push(Math.sin(a1.value))
	})
	vf.adddict("COS",()=>{
		const a1 = vf.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		vf.dstack.push(Math.cos(a1.value))
	})
	vf.adddict("TAN",()=>{
		const a1 = vf.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		vf.dstack.push(Math.tan(a1.value))
	})
	vf.adddict("ASIN",()=>{
		const a1 = vf.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		vf.dstack.push(Math.asin(a1.value))
	})
	vf.adddict("ACOS",()=>{
		const a1 = vf.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		vf.dstack.push(Math.acos(a1.value))
	})
	vf.adddict("ATAN2",()=>{
		const a1 = vf.dstack.pop() 
		const a2 = vf.dstack.pop()
		if(a1.type!="n" || a2.type!="n") throw new RuntimeException("type dont match")	
		vf.dstack.push( Math.atan2(a1.value,a2.value ))
	})
	vf.adddict("DEG",()=>{
		const a1 = vf.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		vf.dstack.push(a1.value*180/Math.PI)
	})
	vf.adddict("RAD",()=>{
		const a1 = vf.dstack.pop()
		if(a1.type!="n") throw new RuntimeException("type dont match")	
		vf.dstack.push(a1.value*Math.PI/180)
	})
//vector manupilation	
	vf.adddict("NORM",()=>{
		const a1 = vf.dstack.pop()
		if(a1.type=="v") {
			const v = a1.value
			if(v.length==2) vf.dstack.push(Math.hypot(v[0],v[1]))
			if(v.length==3) vf.dstack.push(Math.hypot(v[0],v[1],v[2]))
			if(v.length==4) vf.dstack.push(Math.hypot(v[0],v[1],v[2],v[3]))
		}
		else throw new RuntimeException("type dont match")	
	})
	vf.adddict("DOT",()=>{
		const a1 = vf.dstack.pop() 
		const a2 = vf.dstack.pop()
		if(a1.type=="v" && a2.type=="v") {
			let s = 0 
			for(let i=0;i<a2.value.length;i++) {
				s += a2.value[i] * a1.value[i]
			}
			vf.dstack.push(s)
		}
		else throw new RuntimeException("type dont match")	
	})
	vf.adddict("CROSS",()=>{
		const a1 = vf.dstack.pop() 
		const a2 = vf.dstack.pop()
		if(a1.type=="v" && a2.type=="v") {
			let v 
			if(a1.value.length==2) {
				v = a2.value[0]*a1.value[1] - a2.value[1]*a1.value[0]
				vf.dstack.push(v)
			}
			if(a1.value.length==3) {
				v = [a2.value[1]*a1.value[2] - a2.value[2] * a1.value[1],
				a2.value[2]*a1.value[0] - a2.value[0] * a1.value[2],
				a2.value[0]*a1.value[1] - a2.value[1] * a1.value[0]] 
				vf.dstack.push(v,"v")
			}
		}
		else throw new RuntimeException("type dont match")	
	})
	vf.adddict("V2",()=>{
		const a1 = vf.dstack.pop() 
		const a2 = vf.dstack.pop()
		if(a1.type=="n" && a2.type=="n" ) vf.dstack.push([a2.value,a1.value],"v")	
		else throw new RuntimeException("type dont match")	
	})
	vf.adddict("V3",()=>{
		const a1 = vf.dstack.pop() 
		const a2 = vf.dstack.pop()
		const a3 = vf.dstack.pop()
		if(a1.type=="n" && a2.type=="n" && a3.type=="n") vf.dstack.push([a3.value,a2.value,a1.value],"v")
		else throw new RuntimeException("type dont match")			
	})
	vf.adddict("V4",()=>{
		const a1 = vf.dstack.pop() 
		const a2 = vf.dstack.pop()
		const a3 = vf.dstack.pop()
		const a4 = vf.dstack.pop()
		if(a1.type=="n" && a2.type=="n" && a3.type=="n" && a4.type=="n") vf.dstack.push([a4.value,a3.value,a2.value,a1.value],"v")		
		else throw new RuntimeException("type dont match")	
	})
	vf.adddict("M2",()=>{
		const a1 = vf.dstack.pop() 
		const a2 = vf.dstack.pop()
		if(a1.type=="v" && a2.type=="v" ) vf.dstack.push([a2.value,a1.value],"m")	
		else throw new RuntimeException("type dont match")
	})
	vf.adddict("M3",()=>{
		const a1 = vf.dstack.pop() 
		const a2 = vf.dstack.pop()
		const a3 = vf.dstack.pop()
		if(a1.type=="v" && a2.type=="v" && a3.type=="v") vf.dstack.push([a3.value,a2.value,a1.value],"m")
		else throw new RuntimeException("type dont match")			
	})
	vf.adddict("M4",()=>{
		const a1 = vf.dstack.pop() 
		const a2 = vf.dstack.pop()
		const a3 = vf.dstack.pop()
		const a4 = vf.dstack.pop()
		if(a1.type=="v" && a2.type=="v" && a3.type=="v" && a4.type=="v") vf.dstack.push([a4.value,a3.value,a2.value,a1.value],"m")		
		else throw new RuntimeException("type dont match")	
	})
	function insv(self,ofs) {
		const n = self.dstack.pop()
		const t = self.dstack.pop() 
		if(n.type!="n" || t.type!="v") throw new RuntimeException("type dont match")
		t.value[ofs] = n.value
		self.dstack.push(t.value,"v")
	}
	vf.adddict("X.",()=>insv(vf,0))
	vf.adddict("Y.",()=>insv(vf,1))
	vf.adddict("Z.",()=>insv(vf,2))
	vf.adddict("W.",()=>insv(vf,3))
	vf.alias("R.","X.")
	vf.alias("G.","Y.")
	vf.alias("B.","Z.")	
	vf.alias("A.","W.")
	function addv(self,ofs) {
		const n = self.dstack.pop()
		const t = self.dstack.pop() 
		if(n.type!="n" || t.type!="v") throw new RuntimeException("type dont match")
		t.value[ofs] += n.value
		self.dstack.push(t.value,"v")
	}
	vf.adddict("X+",()=>addv(vf,0))
	vf.adddict("Y+",()=>addv(vf,1))
	vf.adddict("Z+",()=>addv(vf,2))
	vf.adddict("W+",()=>addv(vf,3))
	vf.alias("R+","X+")
	vf.alias("G+","Y+")
	vf.alias("B+","Z+")	
	vf.alias("A+","W+")
	function mulv(self,ofs) {
		const n = self.dstack.pop()
		const t = self.dstack.pop() 
		if(n.type!="n" || t.type!="v") throw new RuntimeException("type dont match")
		t.value[ofs] *= n.value
		self.dstack.push(t.value,"v")
	}
	vf.adddict("X*",()=>mulv(vf,0))
	vf.adddict("Y*",()=>mulv(vf,1))
	vf.adddict("Z*",()=>mulv(vf,2))
	vf.adddict("W*",()=>mulv(vf,3))
	vf.alias("R*","X*")
	vf.alias("G*","Y*")
	vf.alias("B*","Z*")
	vf.alias("A*","W*")


	vf.adddict(".X",()=>{
		const t = vf.dstack.top() 
		if(t.type!="v") throw new RuntimeException("type dont match")
		vf.dstack.push(t.value[0])
	})
	vf.adddict(".Y",()=>{
		const t = vf.dstack.top() 
		if(t.type!="v") throw new RuntimeException("type dont match")
		vf.dstack.push(t.value[1])
	})	
	vf.adddict(".Z",()=>{
		const t = vf.dstack.top() 
		if(t.type!="v" || t.value.length<3) throw new RuntimeException("type dont match")
		vf.dstack.push(t.value[2])
	})	
	vf.adddict(".W",()=>{
		const t = vf.dstack.top() 
		if(t.type!="v"|| t.value.length<4) throw new RuntimeException("type dont match")
		vf.dstack.push(t.value[3])
	})
	vf.alias(".R",".X")
	vf.alias(".G",".Y")
	vf.alias(".B",".Z")
	vf.alias(".A",".W")
	vf.adddict(".XY",()=>{
		const t = vf.dstack.top() 
		if(t.type!="v" || t.value.length<2) throw new RuntimeException("type dont match")
		vf.dstack.push(t.value[0])
		vf.dstack.push(t.value[1])
	})
	vf.adddict(".XYZ",()=>{
		const t = vf.dstack.top() 
		if(t.type!="v" || t.value.length<3) throw new RuntimeException("type dont match")
		vf.dstack.push(t.value[0])
		vf.dstack.push(t.value[1])
		vf.dstack.push(t.value[2])
	})
	vf.adddict(".XYZW",()=>{
		const t = vf.dstack.top() 
		if(t.type!="v" || t.value.length<4) throw new RuntimeException("type dont match")
		vf.dstack.push(t.value[0])
		vf.dstack.push(t.value[1])
		vf.dstack.push(t.value[2])
		vf.dstack.push(t.value[3])
	})
	vf.alias(".RG",".XY")
	vf.alias(".RGB",".XYZ")
	vf.alias(".RGBA",".XYZW")

	vf.adddict("IMAT2",()=>{
		vf.dstack.push([[1,0],[0,1]],"m")	
	})
	vf.adddict("IMAT3",()=>{
		vf.dstack.push([[1,0,0],[0,1,0],[0,0,1]],"m")	
	})
	vf.adddict("IMAT4",()=>{
		vf.dstack.push([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]],"m")	
	})
	vf.adddict(".ROW",()=>{
		const n = vf.dstack.pop() 
		const t = vf.dstack.top() 
		if(t.type!="m" || n.type!="n") throw new RuntimeException("type dont match")
		vf.dstack.push(t.value[n.value],"v")
	})	
}