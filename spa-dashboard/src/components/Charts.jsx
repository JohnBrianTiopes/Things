import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';

const WINDOW_DAYS = 14;

const Charts = () => {
    const [users, setUsers] = React.useState([]);
    const [farmers, setFarmers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');

    const fetchChartData = React.useCallback(async () => {
        try {
            const [usersResponse, farmersResponse] = await Promise.all([
                fetch('http://localhost:3001/api/user/'),
                fetch('http://localhost:3001/api/farmer/'),
            ]);

            if (!usersResponse.ok) {
                throw new Error(`Failed to fetch users: ${usersResponse.status}`);
            }
            if (!farmersResponse.ok) {
                throw new Error(`Failed to fetch farmers: ${farmersResponse.status}`);
            }

            const [usersData, farmersData] = await Promise.all([
                usersResponse.json(),
                farmersResponse.json(),
            ]);

            setUsers(Array.isArray(usersData) ? usersData : []);
            setFarmers(Array.isArray(farmersData) ? farmersData : []);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Unable to load dashboard chart data.');
            setUsers([]);
            setFarmers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchChartData();
        const intervalId = setInterval(fetchChartData, 5000);
        return () => clearInterval(intervalId);
    }, [fetchChartData]);

    const { labels, values } = React.useMemo(() => {
        const today = new Date();
        const days = [];

        for (let i = WINDOW_DAYS - 1; i >= 0; i -= 1) {
            const current = new Date(today);
            current.setHours(0, 0, 0, 0);
            current.setDate(today.getDate() - i);
            days.push(current);
        }

        const mapByDate = {};
        for (const day of days) {
            const key = day.toISOString().slice(0, 10);
            mapByDate[key] = 0;
        }

        for (const user of users) {
            if (!user?.created_at) {
                continue;
            }
            const dateKey = new Date(user.created_at).toISOString().slice(0, 10);
            if (Object.prototype.hasOwnProperty.call(mapByDate, dateKey)) {
                mapByDate[dateKey] += 1;
            }
        }

        const nextLabels = days.map((day) =>
            day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        );
        const nextValues = Object.values(mapByDate);

        return { labels: nextLabels, values: nextValues };
    }, [users]);

    const totalUsers = users.length;
    const farmerLimit = 100;
    const totalFarmers = farmers.length;
    const gaugeValue = Math.min(totalFarmers, farmerLimit);

    return (
        <Box sx={{ display: 'grid', gap: 2.5 }}>
            <Box
                sx={{
                    p: 2,
                    border: '1px solid rgba(6, 7, 69, 0.12)',
                    borderRadius: '12px',
                    background: '#eee6e3',
                    boxShadow: '0 6px 14px rgba(6, 7, 69, 0.10)',
                    minHeight: 210,
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Users Signups
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                    Last {WINDOW_DAYS} days signups (total users: {totalUsers})
                </Typography>

                {error && (
                    <Typography variant="body2" sx={{ color: '#b00020', mb: 1 }}>
                        {error}
                    </Typography>
                )}

                {loading ? (
                    <Typography variant="body2">Loading chart...</Typography>
                ) : (
                    <SparkLineChart
                        data={values}
                        xAxis={{ scaleType: 'point', data: labels }}
                        height={110}
                        curve="monotoneX"
                        colors={['#dd5752']}
                        showHighlight
                        showTooltip
                        area
                    />
                )}
            </Box>

            <Box
                sx={{
                    p: 2,
                    border: '1px solid rgba(6, 7, 69, 0.12)',
                    borderRadius: '12px',
                    background: '#eee6e3',
                    boxShadow: '0 6px 14px rgba(6, 7, 69, 0.10)',
                    minHeight: 250,
                    width: { xs: '100%', md: '64%' },
                    justifySelf: { xs: 'stretch', md: 'start' },
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Farmer Capacity
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                    Total farmers tracked out of 100.
                </Typography>

                {loading ? (
                    <Typography variant="body2">Loading gauge...</Typography>
                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.5 }}>
                        <Gauge
                            value={gaugeValue}
                            valueMin={0}
                            valueMax={farmerLimit}
                            startAngle={-110}
                            endAngle={110}
                            innerRadius="78%"
                            outerRadius="100%"
                            width={220}
                            height={170}
                            text={`${totalFarmers}/${farmerLimit}`}
                            sx={(theme) => ({
                                [`& .${gaugeClasses.valueText}`]: {
                                    fontSize: 24,
                                    fontWeight: 700,
                                },
                                [`& .${gaugeClasses.valueArc}`]: {
                                    fill: '#52b202',
                                },
                                [`& .${gaugeClasses.referenceArc}`]: {
                                    fill: theme.palette.text.disabled,
                                },
                            })}
                        />
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default Charts;
