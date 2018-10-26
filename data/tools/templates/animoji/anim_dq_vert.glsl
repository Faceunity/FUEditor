varying vec3 N_frag;
varying vec3 V_frag;
varying vec3 dPds_frag, dPdt_frag;
varying vec2 st_frag;
varying vec3 P_world_frag;

vec3 QuatTransformVector(vec4 Q,vec3 v){
	return v + 2.0*cross(Q.xyz, cross(Q.xyz,v) + Q.w*v);
}

vec4 QuatMul(vec4 a,vec4 b){
	return vec4(a.w*b.xyz+b.w*a.xyz-cross(a.xyz,b.xyz),a.w*b.w-dot(a.xyz,b.xyz));
}

void ComputeTransformLinear(out vec3 R048,out vec3 R372,out vec3 R156,out vec3 T, out vec4 Q_hack){
	// Q_hack is in fact not consistent with the position transformation, but it should work for our purpose
	// Do not Use SKEL0[i] directly in texture2D. Because it triggers an error on Meizu MX5.
	vec3 x2y2z2=vec3(0.0);
	vec3 R372_plus_156=vec3(0.0);
	vec3 R372_minus_156=vec3(0.0);
	T=vec3(0.0);
	vec4 skel_id = SKEL0;
	vec4 skel_weight = WEIGHT0;
	Q_hack=vec4(0.0);
	// for (int i = 0; i < 4; i++) {
	// 	#ifdef USE_VTF
	// 	vec4 Q = texture2DLod(tex_deform, vec2((2.0 * fid + 0.5) / deform_width, skel_id[i]), 0.0);
	// 	#else
	// 	vec4 Q = arrvec4_deform[int(skel_id[i] * cluster_num - 0.0) * 2 + 0];
	// 	#endif
	// 	vec4 weighted_Q=skel_weight[i]*Q;
	// 	x2y2z2+=weighted_Q.xyz*Q.xyz;
	// 	R372_plus_156+=weighted_Q.xyz*Q.yzx;
	// 	R372_minus_156+=Q.w*weighted_Q.zxy;
	// 	#ifdef USE_VTF
	// 	T+=skel_weight[i]*texture2DLod(tex_deform, vec2((2.0 * fid + 1.5) / deform_width, skel_id[i]), 0.0).xyz;
	// 	#else
	// 	T+=skel_weight[i]*arrvec4_deform[int(skel_id[i] * cluster_num - 0.0) * 2 + 1].xyz;
	// 	#endif
	// 	Q_hack+=weighted_Q;
	// }
	{
		#ifdef USE_VTF
		vec4 Q = texture2DLod(tex_deform, vec2((2.0 * fid + 0.5) / deform_width, skel_id.x), 0.0);
		#else
		vec4 Q = arrvec4_deform[int(skel_id.x * cluster_num - 0.0) * 2 + 0];
		#endif
		vec4 weighted_Q=skel_weight.x*Q;
		x2y2z2+=weighted_Q.xyz*Q.xyz;
		R372_plus_156+=weighted_Q.xyz*Q.yzx;
		R372_minus_156+=Q.w*weighted_Q.zxy;
		#ifdef USE_VTF
		T+=skel_weight.x*texture2DLod(tex_deform, vec2((2.0 * fid + 1.5) / deform_width, skel_id.x), 0.0).xyz;
		#else
		T+=skel_weight.x*arrvec4_deform[int(skel_id.x * cluster_num - 0.0) * 2 + 1].xyz;
		#endif
		Q_hack+=weighted_Q;
	}
	{
		#ifdef USE_VTF
		vec4 Q = texture2DLod(tex_deform, vec2((2.0 * fid + 0.5) / deform_width, skel_id.y), 0.0);
		#else
		vec4 Q = arrvec4_deform[int(skel_id.y * cluster_num - 0.0) * 2 + 0];
		#endif
		vec4 weighted_Q=skel_weight.y*Q;
		x2y2z2+=weighted_Q.xyz*Q.xyz;
		R372_plus_156+=weighted_Q.xyz*Q.yzx;
		R372_minus_156+=Q.w*weighted_Q.zxy;
		#ifdef USE_VTF
		T+=skel_weight.y*texture2DLod(tex_deform, vec2((2.0 * fid + 1.5) / deform_width, skel_id.y), 0.0).xyz;
		#else
		T+=skel_weight.y*arrvec4_deform[int(skel_id.y * cluster_num - 0.0) * 2 + 1].xyz;
		#endif
		Q_hack+=weighted_Q;
	}
	{
		#ifdef USE_VTF
		vec4 Q = texture2DLod(tex_deform, vec2((2.0 * fid + 0.5) / deform_width, skel_id.z), 0.0);
		#else
		vec4 Q = arrvec4_deform[int(skel_id.z * cluster_num - 0.0) * 2 + 0];
		#endif
		vec4 weighted_Q=skel_weight.z*Q;
		x2y2z2+=weighted_Q.xyz*Q.xyz;
		R372_plus_156+=weighted_Q.xyz*Q.yzx;
		R372_minus_156+=Q.w*weighted_Q.zxy;
		#ifdef USE_VTF
		T+=skel_weight.z*texture2DLod(tex_deform, vec2((2.0 * fid + 1.5) / deform_width, skel_id.z), 0.0).xyz;
		#else
		T+=skel_weight.z*arrvec4_deform[int(skel_id.z * cluster_num - 0.0) * 2 + 1].xyz;
		#endif
		Q_hack+=weighted_Q;
	}
	{
		#ifdef USE_VTF
		vec4 Q = texture2DLod(tex_deform, vec2((2.0 * fid + 0.5) / deform_width, skel_id.w), 0.0);
		#else
		vec4 Q = arrvec4_deform[int(skel_id.w * cluster_num - 0.0) * 2 + 0];
		#endif
		vec4 weighted_Q=skel_weight.w*Q;
		x2y2z2+=weighted_Q.xyz*Q.xyz;
		R372_plus_156+=weighted_Q.xyz*Q.yzx;
		R372_minus_156+=Q.w*weighted_Q.zxy;
		#ifdef USE_VTF
		T+=skel_weight.w*texture2DLod(tex_deform, vec2((2.0 * fid + 1.5) / deform_width, skel_id.w), 0.0).xyz;
		#else
		T+=skel_weight.w*arrvec4_deform[int(skel_id.w * cluster_num - 0.0) * 2 + 1].xyz;
		#endif
		Q_hack+=weighted_Q;
	}
	skel_id = SKEL1;
	skel_weight = WEIGHT1;
	for (int i = 0; i < 4; i++) {
		#ifdef USE_VTF
		vec4 Q = texture2DLod(tex_deform, vec2((2.0 * fid + 0.5) / deform_width, skel_id[i]), 0.0);
		#else
		vec4 Q = arrvec4_deform[int(skel_id[i] * cluster_num - 0.0) * 2 + 0];
		#endif
		vec4 weighted_Q=skel_weight[i]*Q;
		x2y2z2+=weighted_Q.xyz*Q.xyz;
		R372_plus_156+=weighted_Q.xyz*Q.yzx;
		R372_minus_156+=Q.w*weighted_Q.zxy;
		#ifdef USE_VTF
		T+=skel_weight[i]*texture2DLod(tex_deform, vec2((2.0 * fid + 1.5) / deform_width, skel_id[i]), 0.0).xyz;
		#else
		T+=skel_weight[i]*arrvec4_deform[int(skel_id[i] * cluster_num - 0.0) * 2 + 1].xyz;
		#endif
		Q_hack+=weighted_Q;
	}
	R048=1.0+(-2.0)*(x2y2z2.yxx+x2y2z2.zzy);
	R372=2.0*(R372_plus_156+R372_minus_156);
	R156=2.0*(R372_plus_156-R372_minus_156);
}

vec3 ComputeBoneTranslate(float bone) {
	#ifdef USE_VTF
	vec3 T = texture2DLod(tex_deform, vec2((2.0 * fid + 1.5) / deform_width, bone), 0.0).xyz;
	#else
	vec3 T = arrvec4_deform[int(bone * cluster_num - 0.0) * 2 + 1].xyz;
	#endif
	return T;
}

vec3 LinearTransformVector(vec3 R048,vec3 R372,vec3 R156,vec3 v){
	return v*R048+v.yzx*R156+(v*R372).zxy;
}

void QuatToMatrix(out vec3 R048,out vec3 R372,out vec3 R156,vec4 Q){
	vec3 x2y2z2=Q.xyz*Q.xyz;
	vec3 R372_plus_156=Q.xyz*Q.yzx;
	vec3 R372_minus_156=Q.w*Q.zxy;
	R048=1.0+(-2.0)*(x2y2z2.yxx+x2y2z2.zzy);
	R372=2.0*(R372_plus_156+R372_minus_156);
	R156=2.0*(R372_plus_156-R372_minus_156);
}

mat4 rotationFromQuat(vec4 q){
	float xy = q.x * q.y;
	float yz = q.y * q.z;
	float zx = q.z * q.x;
	float x2 = q.x * q.x;
	float y2 = q.y * q.y;
	float z2 = q.z * q.z;
	float xw = q.x * q.w;
	float yw = q.y * q.w;
	float zw = q.z * q.w;
	// with -1.65 offset
	return mat4(
		1.0-2.0*(y2+z2),2.0*(xy-zw),2.0*(zx+yw),0.0,
		2.0*(xy+zw),1.0-2.0*(x2+z2),2.0*(yz-xw),0.0,
		2.0*(zx-yw),2.0*(yz+xw),1.0-2.0*(x2+y2),0.0,
		-3.3*(xy+zw),3.3*(x2+z2),-3.3*(yz-xw),1.0);
}

void main(){
	vec4 N1=vec4(N, 0.0);
	vec4 P1 = vec4(P*scales, 1.0);
	
	vec3 P2=vec3(0.0);
	vec3 N2=vec3(0.0);
	//mat4 mat_model_view = mat_view;

	vec3 dPs2 = vec3(0.0);
	vec3 dPt2 = vec3(0.0);

	#ifdef USE_SKELETON
        vec3 R048,R372,R156,T;
        vec4 Q_hack;
        ComputeTransformLinear(R048,R372,R156,T,Q_hack);
        P2 = T+LinearTransformVector(R048,R372,R156,P1.xyz);
        N2 = LinearTransformVector(R048,R372,R156,N1.xyz);
        dPs2 = LinearTransformVector(R048,R372,R156,dPds.xyz);
        dPt2 = LinearTransformVector(R048,R372,R156,dPdt.xyz);
		if(isFlipH>0.5){	//animoji不需要-7.364
			P2.x = -P2.x;
			N_frag=normalize((mat_view*model_mat*vec4(-N2.x, N2.y, -N2.z, 0.0)).xyz);
		}
		else{
			N_frag=normalize((mat_view*model_mat*vec4(N2.x, N2.y, -N2.z, 0.0)).xyz);
		}
		vec4 P24 = model_mat * vec4(P2.x, P2.y, -P2.z, 1.0);
		P_world_frag=P24.xyz;
		gl_Position=mat_proj*mat_view*P24;
		V_frag=normalize((mat_view*model_mat*vec4(P2.x, P2.y, -P2.z, 1.0)).xyz);
	#else
		P2 = P1.xyz;
		N2 = N1.xyz;
		dPs2 = dPds.xyz;
		dPt2 = dPdt.xyz;
		N2 = normalize(N2);
        dPs2 = normalize(dPs2);
        mat4 rot=headTransMat * rotationFromQuat(head_rotation_quat) * invHeadTransMat;
		P2 = (rot * vec4(P2.x, P2.y, -P2.z, 1.0)).xyz;
		N2 = (rot * vec4(N2.x, N2.y, -N2.z, 0.0)).xyz;
		if(isFlipH>0.5){	//animoji不需要-7.364
			P2.x = -P2.x;
			N_frag=normalize((mat_view*model_mat*vec4(-N2.x, N2.y, N2.z, 0.0)).xyz);
		}
		else{
			N_frag=normalize((mat_view*model_mat*vec4(N2.x, N2.y, N2.z, 0.0)).xyz);
		}
		vec4 P24 = model_mat * vec4(P2.x, P2.y, P2.z, 1.0);
		P_world_frag=P24.xyz;
		gl_Position=mat_proj*mat_view*P24;
		V_frag=normalize((mat_view*model_mat*vec4(P2.x, P2.y, P2.z, 1.0)).xyz);
	#endif
	
	/*if (dot(dPs2,dPs2) > 0.0)
	{
		if(isFlipH>0.5)
			dPds_frag=normalize((mat_model_view*vec4(-dPs2.x,dPs2.y,-dPs2.z,0.0)).xyz);
		else
			dPds_frag=normalize((mat_model_view*vec4(dPs2.x,dPs2.y,-dPs2.z,0.0)).xyz);
	}
	else dPds_frag=vec3(0.0);
	
	if (dot(dPt2,dPt2) > 0.0)
	{
		if(isFlipH>0.5)
			dPdt_frag=normalize((mat_model_view*vec4(-dPt2.x,dPt2.y,-dPt2.z,0.0)).xyz);
		else
			dPdt_frag=normalize((mat_model_view*vec4(dPt2.x,dPt2.y,-dPt2.z,0.0)).xyz);
	}
	else dPdt_frag=vec3(0.0);*/

	st_frag=st;
}
