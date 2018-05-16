varying vec3 N_frag,dPds_frag,dPdt_frag;
varying vec2 st_frag;
varying vec3 V_frag;

vec3 QuatTransformVector(vec4 Q,vec3 v){
	return v + 2.0*cross(Q.xyz, cross(Q.xyz,v) + Q.w*v);
}

void main(){
	mat4 vpMat = mat_proj * mat_view;
	vec3 Ps=P*scales;
	if(isFlipH>0.5){
		Ps.x = -Ps.x-7.364;
	}
	if(0.5<obj_type&&obj_type<=0.75){
		vec4 head_quat;
		head_quat=vec4(0.0,0.0,0.0,1.0)-quatR1;
		head_quat=quatR1+weight*head_quat;
		Ps -= weightOffset;
		Ps = QuatTransformVector(head_quat,Ps);
		Ps += weightOffset;
		vpMat = mat_proj * mat_cam;
	}else 
		vpMat = mat_proj * mat_view;

	vec4 Pb=vec4(Ps,1.0);
	vec4 N1=vec4(N, 0.0);
	vec3 P2=vec3(0.0);
	vec3 N2=vec3(0.0);

	vec4 dPs1 = vec4(dPds, 0.0);
	vec4 dPt1 = vec4(dPdt, 0.0);
	vec3 dPs2 = vec3(0.0);
	vec3 dPt2 = vec3(0.0);

	if (animating == 1.0) {
		vec4 row[3];
		// Do not Use SKEL0[i] directly in texture2D. Because it triggers an error on Meizu MX5.
		vec4 skel_id = SKEL0;
		vec4 skel_weight = WEIGHT0;
		for (int i = 0; i < 4; i++) {
			for(int j = 0; j < 3; j++) {
				row[j] = texture2D(tex_deform, vec2((3.0 * fid + float(j) + 0.5) / deform_width, skel_id[i]));
			}
			P2 += skel_weight[i] * vec3(dot(Pb, row[0]), dot(Pb, row[1]), dot(Pb, row[2]));
			N2 += skel_weight[i] * vec3(dot(N1, row[0]), dot(N1, row[1]), dot(N1, row[2]));
			dPs2 += skel_weight[i] * vec3(dot(dPs1, row[0]), dot(dPs1, row[1]), dot(dPs1, row[2]));
			dPt2 += skel_weight[i] * vec3(dot(dPt1, row[0]), dot(dPt1, row[1]), dot(dPt1, row[2]));
		}
		skel_id = SKEL1;
		skel_weight = WEIGHT1;
		for (int i = 0; i < 4; i++) {
			for(int j = 0; j < 3; j++) {
				row[j] = texture2D(tex_deform, vec2((3.0 * fid + float(j) + 0.5) / deform_width, skel_id[i]));
			}
			P2 += skel_weight[i] * vec3(dot(Pb, row[0]), dot(Pb, row[1]), dot(Pb, row[2]));
			N2 += skel_weight[i] * vec3(dot(N1, row[0]), dot(N1, row[1]), dot(N1, row[2]));
			dPs2 += skel_weight[i] * vec3(dot(dPs1, row[0]), dot(dPs1, row[1]), dot(dPs1, row[2]));
			dPt2 += skel_weight[i] * vec3(dot(dPt1, row[0]), dot(dPt1, row[1]), dot(dPt1, row[2]));
		}
	} else {
		P2 = Pb.xyz;
		N2 = N1.xyz;
		dPs2 = dPs1.xyz;
		dPt2 = dPt1.xyz;
	}

	P2 = (mat_model * vec4(P2, 1.0)).xyz;
	N2 = (mat_model * vec4(N2, 0.0)).xyz;
	P2.z = -P2.z;

	gl_Position= vpMat * vec4(P2, 1.0);
	
	V_frag=normalize((mat_view*vec4(P2,1.0)).xyz);
		
	if(isFlipH>0.5){
		N_frag=normalize((mat_view*vec4(-N2.x,N2.y,-N2.z,0.0)).xyz);
		dPds_frag=normalize((mat_view*vec4(-dPs2.x,dPs2.y,-dPs2.z,0.0)).xyz);
		dPdt_frag=normalize((mat_view*vec4(-dPt2.x,dPt2.y,-dPt2.z,0.0)).xyz);
	}else{
		N_frag=normalize((mat_view*vec4(N2.x,N2.y,-N2.z,0.0)).xyz);
		dPds_frag=normalize((mat_view*vec4(dPs2.x,dPs2.y,-dPs2.z,0.0)).xyz);
		dPdt_frag=normalize((mat_view*vec4(dPt2.x,dPt2.y,-dPt2.z,0.0)).xyz);
	}
	st_frag=st;
	st_frag.y = 1.0 - st_frag.y;
	st_frag=lbrt.xy + (lbrt.zw-lbrt.xy)*st_frag;
	st_frag.y = 1.0 - st_frag.y;
}
