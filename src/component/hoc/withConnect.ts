import { connect } from 'react-redux';
import { AppState } from '@/redux/types/AppState';

const mapStateToProps = (state: AppState) => ({
  file: state.file,
});

const mapDispatchToProps = (dispatch: any) => ({

});

const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default withConnect; 