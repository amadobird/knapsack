/**
 *  Copyright (C) 2018 Basalt
    This file is part of Knapsack.
    Knapsack is free software; you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by the Free
    Software Foundation; either version 2 of the License, or (at your option)
    any later version.

    Knapsack is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
    FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
    more details.

    You should have received a copy of the GNU General Public License along
    with Knapsack; if not, see <https://www.gnu.org/licenses>.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Header from '../components/header';
import Footer from '../components/footer';
import ErrorCatcher from '../utils/error-catcher';
import './page-without-sidebar.scss';

function PageWithoutSidebar({ children, ...rest }) {
  return (
    <div className="page-without-sidebar">
      <Header {...rest} />
      <ErrorCatcher>{children}</ErrorCatcher>
      <Footer />
    </div>
  );
}

PageWithoutSidebar.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default PageWithoutSidebar;
