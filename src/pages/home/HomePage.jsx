import Banner from "../../components/common/Banner";
import Footer from "../../components/common/Footer";
import Header from "../../components/common/Header";
import Categories from "./Categories";
import { useEffect, useRef, useState } from "react";
import AOS from "aos";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

function HomePage() {
  const { user, isAuthenticated, verificationStatus } = useSelector(
    (state) => state.auth
  );
  const hasWelcomed = useRef(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Loading tối thiểu 1000ms
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (
      !loading &&
      isAuthenticated &&
      verificationStatus?.step === "COMPLETED" &&
      user &&
      !sessionStorage.getItem("hasWelcomed")
    ) {
      Swal.fire({
        title: `Xin chào trở lại, ${user.fullName}!`,
        text: "Chúc bạn một ngày tốt lành",
        icon: "success",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        position: "bottom-end",
        toast: true,
        didOpen: (toast) => {
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
      });
      sessionStorage.setItem("hasWelcomed", "true");
    }
  }, [loading, isAuthenticated, verificationStatus, user]);
  useEffect(() => {
    // Import jQuery và Owl Carousel động
    const loadCarousel = async () => {
      try {
        const jQuery = await import("jquery");
        window.jQuery = jQuery.default;
        window.$ = jQuery.default;

        await import("owl.carousel");

        // Khởi tạo AOS
        AOS.init();

        // Khởi tạo Owl Carousel sau khi đã load jQuery
        jQuery.default(".popular-cartype-slider").owlCarousel({
          loop: true,
          margin: 24,
          nav: true,
          dots: false,
          autoplay: true,
          autoplayTimeout: 3000,
          responsive: {
            0: {
              items: 1,
            },
            768: {
              items: 2,
            },
            992: {
              items: 3,
            },
            1200: {
              items: 4,
            },
          },
        });

        // Khởi tạo Counter Up
        jQuery.default(".counterUp").each(function () {
          jQuery
            .default(this)
            .prop("Counter", 0)
            .animate(
              {
                Counter: jQuery.default(this).text(),
              },
              {
                duration: 3000,
                easing: "swing",
                step: function (now) {
                  jQuery.default(this).text(Math.ceil(now));
                },
              }
            );
        });
      } catch (error) {
        console.error("Error loading carousel:", error);
      }
    };

    loadCarousel();

    // Cleanup function
    return () => {
      if (window.jQuery) {
        window
          .jQuery(".popular-cartype-slider")
          .trigger("destroy.owl.carousel");
      }
      AOS.refresh();
    };
  }, []); // Empty dependency array means this effect runs once on mount

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="loading-spinner"></div>
        <p>Đang tải trang...</p>
      </div>
    );
  }

  return (
    <>
      <div className="main-wrapper">
        <Header />

        <Banner />

        <Categories />

        <section className="more-boats-info-sec">
          <div className="container-fluid">
            <div className="sec-bottom-info">
              <div className="row bottom-text-row">
                <div className="col-xl-3 col-lg-6">
                  <div className="bottom-ship-info-card">
                    <div className="hover-ship-info w-100">
                      <h4>2022 Sea Doo Pontoon for Exciting Adventure</h4>
                      <div className="address-info">
                        <span>
                          <i className="bx bx-map"></i>Heflin, AL
                        </span>
                        <div className="rated-star">
                          <i className="bx bxs-star filled"></i>
                          <i className="bx bxs-star filled"></i>
                          <i className="bx bxs-star filled"></i>
                          <i className="bx bxs-star filled"></i>
                          <i className="bx bxs-star"></i>
                          <span>55 Reviews</span>
                        </div>
                      </div>
                      <ul className="ship-features">
                        <li>Cabins : 4</li>
                        <li>People : 8</li>
                        <li>Length : 4.6</li>
                      </ul>
                      <div className="ship-pricing">
                        <h5>
                          From <span> $180 </span> /day
                        </h5>
                        <a
                          href="listing-details.html"
                          className="btn btn-primary btn-buy"
                        >
                          Book Now
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section services">
          <div className="service-right">
            <img
              src="/img/bg/service-right.svg"
              className="img-fluid"
              alt="services right"
            />
          </div>
          <div className="container">
            {/* Heading title */}
            <div className="section-heading" data-aos="fade-down">
              <h2>How It Works</h2>
              <p>
                Booking a car rental is a straightforward process that typically
                involves the following steps
              </p>
            </div>
            {/* /Heading title */}
            <div className="services-work">
              <div className="row">
                <div
                  className="col-lg-4 col-md-4 col-12 d-flex"
                  data-aos="fade-down"
                >
                  <div className="services-group service-date flex-fill">
                    <div className="services-icon border-secondary">
                      <img
                        className="icon-img bg-secondary"
                        src="/img/icons/services-icon-01.svg"
                        alt="Choose Locations"
                      />
                    </div>
                    <div className="services-content">
                      <h3>1. Choose Date & Locations</h3>
                      <p>
                        Determine the date & location for your car rental.
                        Consider factors such as your travel itinerary,
                        pickup/drop-off locations (e.g., airport, city center),
                        and duration of rental.
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className="col-lg-4 col-md-4 col-12 d-flex"
                  data-aos="fade-down"
                >
                  <div className="services-group service-loc flex-fill">
                    <div className="services-icon border-warning">
                      <img
                        className="icon-img bg-warning"
                        src="/img/icons/services-icon-02.svg"
                        alt="Choose Locations"
                      />
                    </div>
                    <div className="services-content">
                      <h3>2. Pick-Up Locations</h3>
                      <p>
                        Check the availability of your desired vehicle type for
                        your chosen dates and location. Ensure that the rental
                        rates, taxes, fees, and any additional charges.
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className="col-lg-4 col-md-4 col-12 d-flex"
                  data-aos="fade-down"
                >
                  <div className="services-group service-book flex-fill">
                    <div className="services-icon border-dark">
                      <img
                        className="icon-img bg-dark"
                        src="/img/icons/services-icon-03.svg"
                        alt="Choose Locations"
                      />
                    </div>
                    <div className="services-content">
                      <h3>3. Book your Car</h3>
                      <p>
                        Once you've found a car rental option, proceed to make a
                        reservation. Provide the required information, including
                        your details, driver's license, contact info, and
                        payment details.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section facts-number">
          <div className="facts-left">
            <img
              src="/img/bg/facts-left.png"
              className="img-fluid"
              alt="facts left"
            />
          </div>
          <div className="facts-right">
            <img
              src="/img/bg/facts-right.png"
              className="img-fluid"
              alt="facts right"
            />
          </div>
          <div className="container">
            {/* Heading title */}
            <div className="section-heading" data-aos="fade-down">
              <h2 className="title text-white">Facts By The Numbers</h2>
              <p className="description">
                Here are some dreamsrent interesting facts presented by the
                numbers
              </p>
            </div>
            {/* /Heading title */}
            <div className="counter-group">
              <div className="row">
                <div
                  className="col-lg-3 col-md-6 col-12 d-flex"
                  data-aos="fade-down"
                >
                  <div className="count-group flex-fill">
                    <div className="customer-count d-flex align-items-center">
                      <div className="count-img">
                        <img src="/img/icons/bx-heart.svg" alt="Icon" />
                      </div>
                      <div className="count-content">
                        <h4>
                          <span className="counterUp">16</span>K+
                        </h4>
                        <p>Happy Customers</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="col-lg-3 col-md-6 col-12 d-flex"
                  data-aos="fade-down"
                >
                  <div className="count-group flex-fill">
                    <div className="customer-count d-flex align-items-center">
                      <div className="count-img">
                        <img src="/img/icons/bx-car.svg" alt="Icon" />
                      </div>
                      <div className="count-content">
                        <h4>
                          <span className="counterUp">2547</span>+
                        </h4>
                        <p>Count of Cars</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="col-lg-3 col-md-6 col-12 d-flex"
                  data-aos="fade-down"
                >
                  <div className="count-group flex-fill">
                    <div className="customer-count d-flex align-items-center">
                      <div className="count-img">
                        <img src="/img/icons/bx-headphone.svg" alt="Icon" />
                      </div>
                      <div className="count-content">
                        <h4>
                          <span className="counterUp">625</span>+
                        </h4>
                        <p>Car Center Solutions</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="col-lg-3 col-md-6 col-12 d-flex"
                  data-aos="fade-down"
                >
                  <div className="count-group flex-fill">
                    <div className="customer-count d-flex align-items-center">
                      <div className="count-img">
                        <img src="/img/icons/bx-history.svg" alt="Icon" />
                      </div>
                      <div className="count-content">
                        <h4>
                          <span className="counterUp">15000</span>+
                        </h4>
                        <p>Total Kilometer</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section why-choose popular-explore">
          <div className="choose-left">
            <img
              src="/img/bg/choose-left.png"
              className="img-fluid"
              alt="Why Choose Us"
            />
          </div>
          <div className="container">
            {/* Heading title */}
            <div className="row">
              <div className="col-lg-4 mx-auto">
                <div className="section-heading" data-aos="fade-down">
                  <h2>Why Choose Us</h2>
                  <p>We are innovative and passionate about the work we do.</p>
                </div>
              </div>
            </div>
            {/* /Heading title */}
            <div className="why-choose-group">
              <div className="row">
                <div
                  className="col-lg-4 col-md-6 col-12 d-flex"
                  data-aos="fade-down"
                >
                  <div className="card flex-fill">
                    <div className="card-body">
                      <div className="choose-img choose-black">
                        <img src="/img/icons/bx-selection.svg" alt="Icon" />
                      </div>
                      <div className="choose-content">
                        <h4>Easy & Fast Booking</h4>
                        <p>
                          Completely carinate e-business testing process whereas
                          fully researched customer service. Globally extensive
                          content with quality.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="col-lg-4 col-md-6 col-12 d-flex"
                  data-aos="fade-down"
                >
                  <div className="card flex-fill">
                    <div className="card-body">
                      <div className="choose-img choose-secondary">
                        <img src="/img/icons/bx-crown.svg" alt="Icon" />
                      </div>
                      <div className="choose-content">
                        <h4>Many Pickup Location</h4>
                        <p>
                          Enthusiastically magnetic initiatives with
                          cross-platform sources. Dynamically target testing
                          procedures through effective.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="col-lg-4 col-md-6 col-12 d-flex"
                  data-aos="fade-down"
                >
                  <div className="card flex-fill">
                    <div className="card-body">
                      <div className="choose-img choose-primary">
                        <img src="/img/icons/bx-user-check.svg" alt="Icon" />
                      </div>
                      <div className="choose-content">
                        <h4>Customer Satisfaction</h4>
                        <p>
                          Globally user-centric method interactive. Seamlessly
                          revolutionize unique portals corporate collaboration.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

export default HomePage;
