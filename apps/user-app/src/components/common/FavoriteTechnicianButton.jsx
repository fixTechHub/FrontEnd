import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addFavoriteThunk, removeFavoriteThunk, getFavoritesThunk } from '../../features/favorites/favoriteSlice';
import { toast } from 'react-toastify';

const FavoriteTechnicianButton = ({ technicianId }) => {
  const dispatch = useDispatch();
  const { list } = useSelector((state) => state.favorites);
  const getId = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    if (obj._id) return obj._id;
    if (obj.userId) return getId(obj.userId);
    return '';
  };

  const isFavGlobal = list.some((fav) => getId(fav.technicianId) === String(technicianId));
  const [fav, setFav] = useState(isFavGlobal);

  useEffect(() => {
    dispatch(getFavoritesThunk());
  }, [dispatch]);

  useEffect(() => { setFav(isFavGlobal); }, [isFavGlobal]);

  const toggle = () => {
    if (fav) {
      dispatch(removeFavoriteThunk(technicianId)).then(() => {
        dispatch(getFavoritesThunk());
        toast.info('Đã xóa khỏi yêu thích');
      });
    } else {
      dispatch(addFavoriteThunk(technicianId)).then(() => {
        dispatch(getFavoritesThunk());
        toast.success('Đã thêm vào yêu thích');
      });
    }
    setFav(!fav);
  };

  return (
    <button
      type="button"
      className="btn p-0 bg-transparent border-0"
      style={{ lineHeight: 0 }}
      onClick={toggle}
      title={fav ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
    >
      <i
        className={`bi ${fav ? 'bi-heart-fill text-danger' : 'bi-heart'} `}
        style={{ fontSize: '1.6rem' }}
      ></i>
    </button>
  );
};

export default FavoriteTechnicianButton;
