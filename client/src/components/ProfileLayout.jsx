import React, { useEffect, useState } from 'react';

const ProfileLayout = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include token
          },
        });
        const data = await response.json();

        if (response.ok) {
          setUserInfo(data.user);
        } else {
          setError(data.error);
        }
      } catch (error) {
        setError('Error fetching user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const containerStyle = {
    maxWidth: '500px',
    margin: '40px auto',
    padding: '30px',
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 0 20px rgba(128, 0, 128, 0.1)',
    fontFamily: 'Segoe UI, sans-serif',
  };

  const titleStyle = {
    textAlign: 'center',
    color: 'purple',
    marginBottom: '25px',
    fontSize: '1.8rem',
  };

  const infoBoxStyle = {
    padding: '15px 20px',
    borderRadius: '12px',
    backgroundColor: '#f3e5f5',
    border: '1px solid #d1c4e9',
    color: '#4a148c',
    marginBottom: '15px',
  };

  const labelStyle = {
    fontWeight: '600',
    marginBottom: '5px',
    color: 'purple',
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Your Profile</h2>

      <div style={infoBoxStyle}>
        <div style={labelStyle}>Name</div>
        <div>{userInfo.name}</div>
      </div>

      <div style={infoBoxStyle}>
        <div style={labelStyle}>Email</div>
        <div>{userInfo.email}</div>
      </div>
      
      <div style={infoBoxStyle}>
        <div style={labelStyle}>Vehicle Info</div>
        <div>{userInfo.vehicle ? `${userInfo.vehicle.make} ${userInfo.vehicle.model}` : 'No vehicle assigned'}</div>
      </div>

      <div style={infoBoxStyle}>
        <div style={labelStyle}>Contact Info</div>
        <div>
          {userInfo.contactInfo.length > 0 ? userInfo.contactInfo.map(info => (
            <div key={info.value}>{info.type}: {info.value}</div>
          )) : 'No contact info available'}
        </div>
      </div>

      <div style={infoBoxStyle}>
        <div style={labelStyle}>Profile Completion</div>
        <div>{userInfo.completedUserProfile ? 'Completed' : 'Incomplete'}</div>
      </div>

      <div style={infoBoxStyle}>
        <div style={labelStyle}>Accepted User Agreement</div>
        <div>{userInfo.acceptedUserAgreement ? 'Yes' : 'No'}</div>
      </div>

      <div style={infoBoxStyle}>
        <div style={labelStyle}>Account Created On</div>
        <div>{new Date(userInfo.createdAt).toLocaleDateString()}</div>
      </div>
    </div>
  );
};

export default ProfileLayout;
