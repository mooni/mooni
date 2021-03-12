export default `
.mo_mooni-container {
  display: none;
  z-index: 999;
  background: rgba(255,255,255,.15);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 5px;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(4px);
}

.mo_mooni-frame {
  position: relative;
  border-radius: 1rem;
  width: 100%;
  height:700px;
  max-width: 475px;
  max-height: 90%;
  background: #fff;
  display: flex;
}
.mo_mooni-closer {
  position: absolute;
  right: 0;
  top: -30px;
  cursor: pointer;
  font-family: sans-serif;
  font-size: 0.8rem;
  font-weight: 400;
  padding: 4px 12px;
  color: black;
  background-color: white;
  border-radius: 1rem;
}
.mo_mooni-iframe-element {
  flex: 1;
  border: 0 transparent;
}
`;
