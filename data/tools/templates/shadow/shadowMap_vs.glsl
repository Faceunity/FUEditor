
// vec3 QuatTransformVector(vec4 Q, vec3 v){
// 	return v + 2.0 * cross(Q.xyz, cross(Q.xyz, v) + Q.w * v);
// }

void main(){
	vec3 Ps = P * scales;
	//Ps = QuatTransformVector(quatR1, Ps);
	gl_Position = MVP * vec4(Ps, 1.0);
}
