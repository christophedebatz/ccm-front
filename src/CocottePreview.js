import React, { Component } from "react";
import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const style = {
  width: 500,
  height: 500
};

export default class CocottePreview extends Component {
  constructor(props) {
    super(props);
    this.initialize = this.initialize.bind(this);
    this.startAnimationLoop = this.startAnimationLoop.bind(this);
    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.addSceneObjects = this.addSceneObjects.bind(this);
  }
  componentDidMount() {
    this.initialize();
    this.addSceneObjects();
    this.startAnimationLoop();
    window.addEventListener("resize", this.handleWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowResize);
    window.cancelAnimationFrame(this.requestID);
    this.controls.dispose();
  }

  initialize() {
    const width = this.previewRef.clientWidth;
    const height = this.previewRef.clientHeight;

    this.scene = new Three.Scene();
    this.camera = new Three.PerspectiveCamera(
      75, // fov = field of view
      width / height, // aspect ratio
      0.1, // near plane
      700 // far plane
    );
    this.camera.position.z = 30;
    this.controls = new OrbitControls(this.camera, this.prevewRef);
    this.controls.target.set(4.3, -0.4, 5);
    this.renderer = new Three.WebGLRenderer();
    this.renderer.setSize(width, height);
    this.previewRef.appendChild(this.renderer.domElement);
  }

  static drawTriangle(v1, v2, v3, color = 0x156289) {
    const geom = new Three.Geometry();
    const triangle = new Three.Triangle(v1, v2, v3);
    const normal = triangle.normal();
    geom.vertices.push(triangle.a);
    geom.vertices.push(triangle.b);
    geom.vertices.push(triangle.c);
    geom.faces.push(new Three.Face3(0, 1, 2, normal));
    const mesh = new Three.Mesh(
      geom,
      new Three.MeshPhongMaterial({
        color,
        emissive: 0x072534,
        side: Three.DoubleSide,
        flatShading: true
      })
    );
    return mesh;
  }

  static drawCocotteParts() {
    const meshs = [];
    meshs.push(
      CocottePreview.drawTriangle(
        new Three.Vector3(0, 0, 0),
        new Three.Vector3(10, -4, 0),
        new Three.Vector3(10, 10, 0)
      )
    );
    meshs.push(
      CocottePreview.drawTriangle(
        new Three.Vector3(10, -4, 0),
        new Three.Vector3(10, 10, 0),
        new Three.Vector3(10, 0, 10),
        0xffd700
      )
    );
    // meshs.push(
    //   CocottePreview.drawTriangle(
    //     new Three.Vector3(10, 10, 0),
    //     new Three.Vector3(0, 0, 0),
    //     new Three.Vector3(4.3, 0, 5),
    //     0x7a7a7a
    //   )
    // );
    // meshs.push(
    //   CocottePreview.drawTriangle(
    //     new Three.Vector3(10, 10, 0),
    //     new Three.Vector3(4.3, 0, 5),
    //     new Three.Vector3(10, 0, 10),
    //     0xff0000
    //   )
    // );
    // meshs.push(
    //   CocottePreview.drawTriangle(
    //     new Three.Vector3(0, 0, 0),
    //     new Three.Vector3(4.3, -0.4, 5),
    //     new Three.Vector3(3, -5, 5),
    //     0xffffff
    //   )
    // );
    // meshs.push(
    //   CocottePreview.drawTriangle(
    //     new Three.Vector3(3, -5, 5),
    //     new Three.Vector3(10, 0, 10),
    //     new Three.Vector3(4.3, -0.4, 5),
    //     0xff0000
    //   )
    // );
    return meshs;
  }

  addSceneObjects() {
    CocottePreview.drawCocotteParts().forEach(mesh => this.scene.add(mesh));
    // CocottePreview.drawCocotteParts().forEach(mesh => {
    //   mesh.rotation.y = Math.PI;
    //   mesh.position.x += 9.4;
    //   mesh.position.z += 9.7;
    //   this.scene.add(mesh);
    // });

    const lights = [];
    lights[0] = new Three.PointLight(0xffffff, 3, 0);
    lights[1] = new Three.PointLight(0xffffff, 3, 0);
    lights[2] = new Three.PointLight(0xffffff, 3, 0);

    lights[0].position.set(0, 200, 0);
    lights[1].position.set(100, 200, 100);
    lights[2].position.set(-100, -200, -100);

    this.scene.add(lights[0]);
    this.scene.add(lights[1]);
    this.scene.add(lights[2]);
  }

  startAnimationLoop() {
    this.renderer.render(this.scene, this.camera);

    // The window.requestAnimationFrame() method tells the browser that you wish to perform
    // an animation and requests that the browser call a specified function
    // to update an animation before the next repaint
    this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
  }

  handleWindowResize() {
    const width = this.prevewRef.clientWidth;
    const height = this.previewRef.clientHeight;

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;

    this.camera.updateProjectionMatrix();
  }

  render() {
    return <div style={style} ref={ref => (this.previewRef = ref)} />;
  }
}
