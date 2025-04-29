import React from "react";
import "../styles/Home.css";
import FeaturedPGSlider from "../components/FeaturedPGSlider";

const HomeSection = () => {
  return (
    <div className="home-section">
      <div className="fst">
        <div className="left-side">
          <div className="top-div">
            <div className="first">
              <p className="head-text">20+</p>
              <p className="sub-text">PLACES</p>
              <div className="places-logo">
                <img src="/assets/plc1.jpg" className="icon1" alt="plc1" />
                <img src="/assets/plc2.jpg" className="icon1" alt="plc2" />
                <img src="/assets/plc3.jpg" className="icon1" alt="plc3" />
              </div>
            </div>
            <div className="second">
              <p className="head-text">1K+</p>
              <p className="sub-text">PGs</p>
              <div className="places-logo">
                <img src="/assets/house.png" className="icon1" alt="house1" />
                <img src="/assets/house1.png" className="icon1" alt="house2" />
              </div>
            </div>
            <img src="/assets/bgimg.webp" className="bg" alt="background" />
          </div>
          <div className="bottom-div">
            <p className="ht1">WHerE</p>
            <p className="ht2">to StAY</p>
            <p className="ht3">NexT..?</p>
            <div className="bt">
              <div className="lt">
                <img src="/assets/usr1.jpg" className="icon2" alt="usr1" />
                <img src="/assets/usr2.jpg" className="icon2" alt="usr2" />
                <img src="/assets/usr3.jpg" className="icon2" alt="usr3" />
              </div>
              <div className="rt">
                <img src="/assets/arrw.png" className="icon2" alt="arrow" />
              </div>
            </div>
          </div>
        </div>
        <div className="right-side">
          <div className="right-side-sub">
            <div className="off-txt1">
              <p className="off-sub">On First Booking</p>
            </div>
            <div className="off-txt2">
              <p className="off-head">20% OFF</p>
            </div>
          </div>
        </div>
      </div>
      <div className="scnd">
        <FeaturedPGSlider />
      </div>
      <div className="mcontainer">
      {/* Navigation */}
        <div className="navigation">
          <div className="nav-items">
            <div className="nav-card">
              <h2>10 Beds</h2>
              <p>Mixed Dormitory Rooms</p>
            </div>
            <div className="nav-card">
              <h2>8 Beds</h2>
              <p>AC Dormitory Rooms</p>
            </div>
            <div className="nav-card">
              <h2>6 Beds</h2>
              <p>Mixed Dormitory Rooms</p>
            </div>
            <div className="nav-card">
              <h2>Family Room</h2>
              <p>4 Beds 2 Baths</p>
            </div>
            <div className="nav-card">
              <h2>3 BHK Apartment</h2>
              <p>1 Bunk Bed, 2 Double Beds</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <h1>Reserve and Enjoy</h1>
          <h2>Unforgettable Memories</h2>
          <p>
            These services aim to create a comfortable and supportive living
            environment
          </p>
        </div>

        {/* Cards Section */}
        <div className="cards-container">
          {[
            {
              img: "https://storage.googleapis.com/a1aa/image/wA7ftKCNr9LShe7g7DGqw1aOD-r59Jvvajganz51c_c.jpg",
              title: "Furnished dormitories with facilities",
              price: "$12.23",
            },
            {
              img: "https://storage.googleapis.com/a1aa/image/yc3VUKhEWNgCVL7sFXC6HizlY_sRcVRZSsZZycG-wYI.jpg",
              title: "A well-designed dormitory",
              price: "$18.25",
            },
            {
              img: "https://storage.googleapis.com/a1aa/image/Xx8RNvToR1Sm1Du0OAvGLjqAEMhUQiJoPCq4dsC3mi4.jpg",
              title: "Providing rooms for students",
              price: "$18.23",
            },
            {
              img: "https://storage.googleapis.com/a1aa/image/8UJ10gRjQz1nDWuSwAew91_Tb_0YWSi1RLCqpznN7IY.jpg",
              title: "We provide 10 beds dormitories",
              price: "$32.23",
            },
          ].map((item, index) => (
            <div key={index} className="card">
              <img src={item.img} alt={item.title} className="card-img" />
              <div className="price-tag">{item.price}</div>
              <div className="card-content">
                <p>{item.title}</p>
              </div>
              <div className="arrow-icon">➜</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeSection;