varying vec3 N_frag;
varying vec2 st_frag;
varying vec3 V_frag;
varying vec3 P_world_frag;

void main(){
	vec3 Ps=P*scales;
	Ps = (model_mat*vec4(Ps,1.0)).xyz;
	Ps.z=-Ps.z;
	
	// MARK:
	P_world_frag = Ps;

	vec4 modelPosition = (mat_view*vec4(Ps,1.0));
	
	gl_Position=mat_proj*modelPosition;
	N_frag=normalize((mat_view*vec4(N.x,N.y,-N.z,0.0)).xyz);
	V_frag=normalize(modelPosition.xyz);
	
	st_frag=st;
}
