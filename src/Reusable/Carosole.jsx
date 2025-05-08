// Carosole.js
import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Carousel from 'react-bootstrap/Carousel';
import brand from "../videos/ogerabrand1.mp4"
import Gas from "../videos/Gas.mp4"
import Mixie from "../videos/mixer.mp4";
import induction from "../videos/induct.mp4";

const Carosole = () => {
  return (
    <Carousel className="w-100 carousel-video-container">
      <Carousel.Item>
        <video 
          className="d-block w-100" 
          autoPlay 
          loop 
          muted
          playsInline 
        >
          <source src={brand} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* <Carousel.Caption>
          <h3>Tawa</h3>
        </Carousel.Caption> */}
      </Carousel.Item>
      <Carousel.Item>
        <video 
          className="d-block w-100" 
          autoPlay 
          loop 
          muted
          playsInline
        >
          <source src={Mixie} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* <Carousel.Caption>
          <h3>Mixer</h3>
          <p>Sample Text for Video Slide</p>
        </Carousel.Caption> */}
      </Carousel.Item>
      <Carousel.Item>
        <video 
          className="d-block w-100" 
          autoPlay 
          loop 
          muted
          playsInline
        >
          <source src={Gas} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
      </Carousel.Item>
      <Carousel.Item>
        <video 
          className="d-block w-100" 
          autoPlay 
          loop 
          muted
          playsInline
        >
          <source src={induction} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
      </Carousel.Item>
    </Carousel>
  );
};

export default Carosole;