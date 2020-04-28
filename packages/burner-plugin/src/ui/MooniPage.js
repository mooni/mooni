import React, { useRef, useLayoutEffect } from 'react';
const appUrl = process.env.REACT_APP_MOONI_URL || 'http://localhost:5000/exchange';
const MooniPage = ({ burnerComponents, plugin }) => {
    const { Page } = burnerComponents;
    const mooniContainer = useRef(null);
    const _plugin = plugin;
    useLayoutEffect(() => {
        if (!mooniContainer.current)
            return;
        const container = mooniContainer.current;
        console.log('fezf');
    }, []);
    return (React.createElement(Page, { title: "Cssdsdash out" },
        React.createElement("div", { ref: mooniContainer, style: { flex: 1 } })));
};
export default MooniPage;
//# sourceMappingURL=MooniPage.js.map