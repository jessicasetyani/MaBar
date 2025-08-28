import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';

const PlayerProfile = () => {
  const { user, updatePlayerProfile, getPlayerProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState(null);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await getPlayerProfile();
      setProfile(profileData);
      
      // Set form values
      setValue('skill_level', profileData.skill_level || '');
      setValue('play_style', profileData.play_style || '');
      setValue('availability', profileData.availability || []);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage('');
    
    try {
      await updatePlayerProfile({
        skill_level: data.skill_level,
        play_style: data.play_style,
        availability: Array.isArray(data.availability) ? data.availability : [data.availability].filter(Boolean)
      });
      
      setMessage('Profile updated successfully!');
      loadProfile(); // Reload to get updated data
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'player') {
    return <div>This page is only available for players.</div>;
  }

  return (
    <div className="player-profile">
      <h2>Player Profile</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
        <div className="form-group">
          <label htmlFor="skill_level">Skill Level</label>
          <select
            id="skill_level"
            {...register('skill_level', { required: 'Skill level is required' })}
            className={errors.skill_level ? 'error' : ''}
          >
            <option value="">Select your skill level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="professional">Professional</option>
          </select>
          {errors.skill_level && <span className="error-message">{errors.skill_level.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="play_style">Play Style</label>
          <input
            type="text"
            id="play_style"
            placeholder="e.g., Aggressive, Defensive, All-around"
            {...register('play_style')}
          />
        </div>

        <div className="form-group">
          <label>Availability</label>
          <div className="checkbox-group">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
              <label key={day} className="checkbox-label">
                <input
                  type="checkbox"
                  value={day}
                  {...register('availability')}
                />
                {day}
              </label>
            ))}
          </div>
        </div>

        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>

      {profile && (
        <div className="current-profile">
          <h3>Current Profile</h3>
          <p><strong>Skill Level:</strong> {profile.skill_level || 'Not set'}</p>
          <p><strong>Play Style:</strong> {profile.play_style || 'Not set'}</p>
          <p><strong>Availability:</strong> {profile.availability?.length ? profile.availability.join(', ') : 'Not set'}</p>
        </div>
      )}
    </div>
  );
};

export default PlayerProfile;