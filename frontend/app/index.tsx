import React, { useEffect, useState } from "react";
import Header from '../components/Header';

export default function Home() {

  // Define styles that match the original CSS
  const styles: { [key: string]: React.CSSProperties } = {
    appContainer: {
      backgroundColor: '#000',
      minHeight: '100vh',
      width: '100%',
      position: 'relative',
      margin: 0,
      padding: 0,
      color: 'white',
      fontFamily: "'Montserrat', sans-serif",
    },
    auroraContainer: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      zIndex: 1,
      opacity: 0.3,
      pointerEvents: 'none',
    },
    aurora: {
      position: 'absolute',
      top: '-10px',
      left: '-10px',
      right: '-10px',
      bottom: '-10px',
      backgroundImage: `
        repeating-linear-gradient(100deg, #fff 0%, #fff 7%, transparent 10%, transparent 12%, #fff 16%),
        repeating-linear-gradient(100deg, #012168 10%, #123995 15%, #2854b0 20%, #3a66c5 25%, #012168 30%)
      `,
      backgroundSize: '300%, 200%',
      backgroundPosition: '50% 50%, 50% 50%',
      filter: 'blur(10px)',
      mixBlendMode: 'overlay',
      animation: 'aurora 15s infinite',
      maskImage: 'radial-gradient(ellipse at 100% 0%, black 10%, transparent 70%)',
    },
    content: {
      maxWidth: '800px',
      margin: '50px auto',
      padding: '0 20px',
      position: 'relative',
      zIndex: 2,
      textAlign: 'right',
      marginLeft: 'auto',
    },
    blockTitle: {
      fontSize: '32px',
      fontWeight: 700,
      marginBottom: '20px',
      color: 'white',
    },
    textBlock: {
      lineHeight: 1.6,
      marginBottom: '20px',
      fontSize: '18px',
    },
    highlightText: {
      display: 'inline-block',
      position: 'relative',
      backgroundImage: 'linear-gradient(to right, #B10024, #001A4F)',
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'left center',
      padding: '0 4px',
      borderRadius: '4px',
      color: 'white',
    },
    heroHighlightContainer: {
      position: 'relative',
      overflow: 'hidden',
    },
  };

  // CSS keyframes need to be added to the document
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');
      
      @keyframes aurora {
        0%, 100% {
          background-position: 0% 50%, 0% 50%;
        }
        50% {
          background-position: 100% 100%, 100% 100%;
        }
      }
      
      .aurora::after {
        content: "";
        position: absolute;
        inset: 0;
        background-image:
          repeating-linear-gradient(100deg, #fff 0%, #fff 7%, transparent 10%, transparent 12%, #fff 16%),
          repeating-linear-gradient(100deg, #012168 10%, #123995 15%, #2854b0 20%, #3a66c5 25%, #012168 30%);
        background-size: 200%, 100%;
        background-attachment: fixed;
        mix-blend-mode: difference;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={styles.appContainer}>
      {/* Header Component */}
      <Header />
      
      {/* Background aurora effect */}
      <div style={styles.auroraContainer}>
        <div className="aurora" style={styles.aurora}></div>
      </div>

      {/* Home Page Content */}
      <div style={styles.content}>
        <div style={styles.heroHighlightContainer}>
          <div style={styles.blockTitle}>Welcome to Progress</div>
          <div style={styles.textBlock}>
            <span style={styles.highlightText}>A political party beyond left and right.</span><br />
            A workshop in which the future of Britain is being built.<br />
            A partnership of the able. <br /><br /><br /><br />
            Maybe you hate politics.<br />
            Maybe you think ordinary people could govern better than politicians do.<br />
            We think you're right.<br /><br /><br /> 
            That's what Progress is - a party full of ordinary people, doing extraordinary things.
          </div>
        </div>
      </div>
    </div>
  );
}
