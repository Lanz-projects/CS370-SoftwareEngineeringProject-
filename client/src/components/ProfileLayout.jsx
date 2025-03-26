import React from 'react';

const ProfileLayout = () => {
  const userInfo = {
    name: 'Halma',
    email: 'Ruthie@retire.edu',
    phone: '123-456-7890',
    vehicle: 'fusion',
    bannerId: 'T01234567',
  };

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
        <div style={labelStyle}>Phone Number</div>
        <div>{userInfo.phone}</div>
      </div>

      <div style={infoBoxStyle}>
        <div style={labelStyle}>Vehicle Info</div>
        <div>{userInfo.vehicle}</div>
      </div>

      <div style={infoBoxStyle}>
        <div style={labelStyle}>Truman Banner ID</div>
        <div>{userInfo.bannerId}</div>
      </div>
    </div>
  );
};

export default ProfileLayout;
