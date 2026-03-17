import React from 'react';

const QuantFigures = () => {
    const [counts, setCounts] = React.useState({
        farms: 0,
        farmer: 0,
        users: 0,
        harvests: 0,
        variety: 0,
    });

    const fetchCounts = React.useCallback(async () => {
        try {
            const response = await fetch('http://localhost:3001/api/data-count');
            if (!response.ok) {
                throw new Error(`Failed to fetch counts: ${response.status}`);
            }

            const data = await response.json();
            setCounts({
                farms: Number(data?.farms ?? 0),
                farmer: Number(data?.farmer ?? 0),
                users: Number(data?.users ?? 0),
                harvests: Number(data?.harvests ?? 0),
                variety: Number(data?.variety ?? 0),
            });
        } catch (error) {
            console.error(error);
        }
    }, []);

    React.useEffect(() => {
        fetchCounts();
        const intervalId = setInterval(fetchCounts, 5000);
        return () => clearInterval(intervalId);
    }, [fetchCounts]);

    return (
        <div>
            <div className='figs'>
                <div className='fig-item'>
                    <span className='fig-quant'>{counts.farms}</span>
                    <span className='fig-label'>Farms</span>
                </div>
                <div className='fig-item'>
                    <span className='fig-quant'>{counts.farmer}</span>
                    <span className='fig-label'>Farmers</span>
                </div>
                <div className='fig-item'>
                    <span className='fig-quant'>{counts.users}</span>
                    <span className='fig-label'>Users</span>
                </div>
                <div className='fig-item'>
                    <span className='fig-quant'>{counts.harvests}</span>
                    <span className='fig-label'>Harvest</span>
                </div>
                <div className='fig-item'>
                    <span className='fig-quant'>{counts.variety}</span>
                    <span className='fig-label'>Variety</span>
                </div>
            </div>
        </div>
    )
}

export default QuantFigures