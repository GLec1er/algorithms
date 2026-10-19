/** Optional 2.5D image mesh. All teaching content remains ordinary React/SVG. */
export type PyMode='idle'|'playing'|'paused'|'complete';
const vertex=`
attribute vec2 a_uv;
varying vec2 v_uv;
uniform vec4 u_motion;
uniform vec2 u_gesture;
void main(){
 float t=u_motion.x,energy=u_motion.y;
 vec2 p=a_uv;
 float head=1.0-smoothstep(0.24,0.65,p.y);
 float neck=exp(-pow((p.x-0.53)/0.28,2.0))*head;
 float angle=head*(energy*(0.024*sin(t*0.91)+0.009*sin(t*1.47+1.1))+u_motion.z*0.035+u_gesture.x*0.095);
 vec2 pivot=vec2(0.52,0.63),q=p-pivot;
 p=pivot+mat2(cos(angle),sin(angle),-sin(angle),cos(angle))*q;
 p.x+=neck*energy*0.004*sin(t*0.67);
 p.y+=head*u_motion.w*0.013;
 float tail=smoothstep(0.66,0.94,a_uv.x)*smoothstep(0.57,0.87,a_uv.y);
 p.y+=tail*(energy*0.013*sin(t*1.21+1.7)+u_gesture.y*0.040);
 p.x+=tail*energy*0.004*sin(t*1.21);
 vec2 b=(a_uv-vec2(0.48,0.76))*vec2(3.0,4.0);
 p.x+=(a_uv.x-0.48)*exp(-dot(b,b))*energy*0.008*sin(t*0.79);
 p.y+=energy*0.0025*sin(t*0.79);
 p=vec2(0.5)+(p-vec2(0.5))*0.91;
 gl_Position=vec4(p.x*2.0-1.0,1.0-p.y*2.0,0.0,1.0);
 v_uv=a_uv;
}`;
const fragment=`precision mediump float;varying vec2 v_uv;uniform sampler2D u_image;void main(){gl_FragColor=texture2D(u_image,v_uv);}`;

export class PyRenderer{
 private gl:WebGLRenderingContext|null=null;
 private program:WebGLProgram|null=null;
 private buffer:WebGLBuffer|null=null;
 private texture:WebGLTexture|null=null;
 private motionUniform:WebGLUniformLocation|null=null;
 private gestureUniform:WebGLUniformLocation|null=null;
 private resize:ResizeObserver|null=null;
 private vertexCount=0;
 private disposed=false;
 private visible=false;
 private enabled=true;
 private mode:PyMode='paused';
 private energy=0;private lookX=0;private lookY=0;private targetX=0;private targetY=0;
 private nod=0;private nodVelocity=0;private tail=0;private tailVelocity=0;
 private clock=0;private raf=0;private lastTime=0;private lastPaint=0;
 constructor(private canvas:HTMLCanvasElement,private host:HTMLElement,private onFailure:()=>void){}

 initialize(image:HTMLImageElement){
  const gl=this.canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false,powerPreference:'low-power'});
  if(!gl)throw new Error('WebGL unavailable');
  this.gl=gl;
  const shaders:WebGLShader[]=[];
  try{
   this.program=gl.createProgram();if(!this.program)throw new Error('Program allocation failed');
   for(const [type,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]] as const){
    const shader=gl.createShader(type);if(!shader)throw new Error('Shader allocation failed');shaders.push(shader);
    gl.shaderSource(shader,source);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error('Shader compilation failed');
    gl.attachShader(this.program,shader);
   }
   gl.linkProgram(this.program);
   if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw new Error('Program link failed');
  }finally{for(const shader of shaders)gl.deleteShader(shader);}
  gl.useProgram(this.program);
  const points:number[]=[],count=40;
  for(let y=0;y<count;y++)for(let x=0;x<count;x++){
   const l=x/count,r=(x+1)/count,t=y/count,b=(y+1)/count;points.push(l,t,r,t,l,b,l,b,r,t,r,b);
  }
  this.vertexCount=points.length/2;
  this.buffer=gl.createBuffer();this.texture=gl.createTexture();
  if(!this.buffer||!this.texture)throw new Error('Mesh allocation failed');
  gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(points),gl.STATIC_DRAW);
  const uv=gl.getAttribLocation(this.program,'a_uv');gl.enableVertexAttribArray(uv);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,0,0);
  gl.bindTexture(gl.TEXTURE_2D,this.texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
  this.motionUniform=gl.getUniformLocation(this.program,'u_motion');this.gestureUniform=gl.getUniformLocation(this.program,'u_gesture');
  gl.uniform1i(gl.getUniformLocation(this.program,'u_image'),0);gl.disable(gl.BLEND);gl.clearColor(0,0,0,0);
  this.canvas.addEventListener('webglcontextlost',this.contextLost);
  document.addEventListener('visibilitychange',this.visibilityChanged);
  this.resize=new ResizeObserver(()=>{this.size();this.wake();});this.resize.observe(this.host);
  this.size();this.draw();
 }
 private size(){
  if(!this.gl||this.disposed)return;
  const r=this.host.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.5);
  this.canvas.width=Math.max(1,Math.round(r.width*dpr));this.canvas.height=Math.max(1,Math.round(r.height*dpr));
  this.gl.viewport(0,0,this.canvas.width,this.canvas.height);
 }
 setMode(mode:PyMode){
  const changed=mode!==this.mode;this.mode=mode;
  if(mode==='paused'){this.targetX=0;this.targetY=0;}
  if(changed&&this.enabled){
   if(mode==='complete'){this.nodVelocity=1.8;this.tailVelocity=3;}
   else if(mode==='playing')this.nodVelocity+=0.5;
  }
  this.wake();
 }
 setEnabled(enabled:boolean){this.enabled=enabled;if(!enabled)this.resetMotion();this.wake();}
 setVisible(visible:boolean){this.visible=visible;this.wake();}
 setPointer(x:number,y:number){if(this.mode==='paused'||!this.enabled)return;this.targetX=Math.max(-1,Math.min(1,x));this.targetY=Math.max(-1,Math.min(1,y));this.wake();}
 pulse(){if(!this.enabled)return;this.nodVelocity=Math.min(1.6,this.nodVelocity+0.7);this.wake();}
 private resetMotion(){this.energy=0;this.lookX=0;this.lookY=0;this.targetX=0;this.targetY=0;this.nod=0;this.nodVelocity=0;this.tail=0;this.tailVelocity=0;}
 private visibilityChanged=()=>this.wake();
 private contextLost=(event:Event)=>{event.preventDefault();this.dispose();this.onFailure();};
 private wake(){
  if(this.disposed)return;
  if(!this.visible||document.hidden){cancelAnimationFrame(this.raf);this.raf=0;this.lastTime=0;this.host.dataset.motionRunning='false';return;}
  if(!this.raf){this.lastTime=0;this.raf=requestAnimationFrame(this.tick);}
 }
 private tick=(now:number)=>{
  this.raf=0;if(this.disposed||!this.visible||document.hidden){this.host.dataset.motionRunning='false';this.lastTime=0;return;}
  const dt=this.lastTime?Math.min((now-this.lastTime)/1000,0.05):1/60;this.lastTime=now;
  const target=this.enabled?(this.mode==='idle'?1:this.mode==='playing'?1.3:0):0,ease=1-Math.exp(-dt*7);
  this.energy+=(target-this.energy)*ease;this.lookX+=(this.targetX-this.lookX)*ease;this.lookY+=(this.targetY-this.lookY)*ease;
  this.nodVelocity+=(-65*this.nod-13*this.nodVelocity)*dt;this.nod+=this.nodVelocity*dt;
  this.tailVelocity+=(-42*this.tail-10*this.tailVelocity)*dt;this.tail+=this.tailVelocity*dt;
  if(!this.enabled)this.resetMotion();
  this.clock+=dt;
  const unsettled=Math.abs(this.energy-target)+Math.abs(this.lookX-this.targetX)+Math.abs(this.lookY-this.targetY)+Math.abs(this.nod)+Math.abs(this.nodVelocity)+Math.abs(this.tail)+Math.abs(this.tailVelocity);
  const active=target>0||unsettled>0.001;
  if(now-this.lastPaint>=32||!active){if(!active){this.energy=target;this.nod=0;this.tail=0;}this.draw();this.lastPaint=now;}
  this.host.dataset.motionRunning=String(active);if(active)this.raf=requestAnimationFrame(this.tick);
 };
 private draw(){
  const gl=this.gl;if(!gl||this.disposed)return;
  gl.useProgram(this.program);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform4f(this.motionUniform,this.clock,this.energy,this.lookX,this.lookY);gl.uniform2f(this.gestureUniform,this.nod,this.tail);
  gl.drawArrays(gl.TRIANGLES,0,this.vertexCount);
 }
 dispose(){
  if(this.disposed)return;this.disposed=true;cancelAnimationFrame(this.raf);this.raf=0;
  this.resize?.disconnect();this.canvas.removeEventListener('webglcontextlost',this.contextLost);document.removeEventListener('visibilitychange',this.visibilityChanged);
  if(this.gl){this.gl.deleteTexture(this.texture);this.gl.deleteBuffer(this.buffer);this.gl.deleteProgram(this.program);if(!this.gl.isContextLost())this.gl.getExtension('WEBGL_lose_context')?.loseContext();}
  this.host.dataset.motionRunning='false';
 }
}
export function createPyRenderer(canvas:HTMLCanvasElement,image:HTMLImageElement,host:HTMLElement,onFailure:()=>void){
 const renderer=new PyRenderer(canvas,host,onFailure);
 try{renderer.initialize(image);return renderer;}catch(error){renderer.dispose();throw error;}
}
