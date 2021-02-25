import React, { useCallback } from 'react'
import * as typeformEmbed from '@typeform/embed'
import styled from 'styled-components';

const Container = styled.div`
  position:fixed;
  bottom: 20%;
  right:0;
  transition:width 300ms ease-out;
  width:0;
  z-index: 9999;
`;

const Button = styled.a`
  position:absolute;
  height:44px;
  padding:0 12px;
  margin:0;
  cursor:pointer;
  background:#5aa58b;
  border-radius:4px 4px 0px 0px;
  display:flex;
  align-items:center;
  justify-content:center;
  transform:rotate(-90deg);
  transform-origin:bottom left;
  color:white;
  text-decoration:none;
  z-index:9999;


  @media (max-width: 480px) {
    padding:0 6px;
    height:32px;
  }

  .icon {
    width:32px;
    transform:rotate(90deg) scale(0.85);
    display: flex;
    justify-content: center;
  }

  @media (max-width: 480px) {
    .icon {
      transform:rotate(90deg) scale(0.65);
    }
  }

  .text {
    text-decoration:none;
    font-size:1rem;
    font-family:Helvetica,Arial,sans-serif;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
    width:100%;
    text-align:center;
    -webkit-font-smoothing:antialiased;
    -moz-osx-font-smoothing:grayscale;
    margin-left: 6px;
  }

  @media (max-width: 480px) {
    .text {
      display: none;
    }
  }
`;

export const TypeformFeedback = () => {
  const open = useCallback(() => {
    typeformEmbed.makePopup('https://hk5hwnv2z2a.typeform.com/to/SDePihMe', {
      mode: 'drawer_right',
      open: 'load',
    });
  }, [])

  return (
    <Container>
      <Button onClick={open}>
        <span className="icon">
          <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M21 0H0V9L10.5743 24V16.5H21C22.6567 16.5 24 15.1567 24 13.5V3C24 1.34325 22.6567 0 21 0ZM7.5 9.75C6.672 9.75 6 9.07875 6 8.25C6 7.42125 6.672 6.75 7.5 6.75C8.328 6.75 9 7.42125 9 8.25C9 9.07875 8.328 9.75 7.5 9.75ZM12.75 9.75C11.922 9.75 11.25 9.07875 11.25 8.25C11.25 7.42125 11.922 6.75 12.75 6.75C13.578 6.75 14.25 7.42125 14.25 8.25C14.25 9.07875 13.578 9.75 12.75 9.75ZM18 9.75C17.172 9.75 16.5 9.07875 16.5 8.25C16.5 7.42125 17.172 6.75 18 6.75C18.828 6.75 19.5 7.42125 19.5 8.25C19.5 9.07875 18.828 9.75 18 9.75Z'
              fill='white'
            />
          </svg>
        </span>
        <span className="text">
          Give feedback
        </span>
      </Button>
    </Container>
  );
}
