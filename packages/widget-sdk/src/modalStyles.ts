export default `
.mo_mooni-container {
  display: none;
  z-index: 999;
  background: rgba(0,0,0,.8);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 5px;
  justify-content: center;
  align-items: center;
  padding-top: 23px;
}
.mo_mooni-frame {
  position: relative;
  border-radius: 1rem;
  width: 100%;
  height: 100%;
  max-width: 400px;
  max-height: 600px;
  background: #fff;
  display: flex;
}
.mo_mooni-closer {
  position: absolute;
  right: 16px;
  top: -20px;
  cursor: pointer;
  color: white;
  font-family: sans-serif;
  font-size: 0.8rem;
  font-weight: 400;
}
`;
