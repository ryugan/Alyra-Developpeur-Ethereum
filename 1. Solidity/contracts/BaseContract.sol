// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract BaseContract is Ownable {

    event Received(address, uint);
    event Fallbacked(address, uint);
    event Widthdrawed(address, uint);

    /**
     * @dev Emit if Received value.
     */
    receive() external payable {
        emit Received(_msgSender(), msg.value);
    }

    /**
     * @dev Emit if Received value and data.
     */
    fallback() external payable {
        emit Fallbacked(_msgSender(), msg.value);
    }

    /**
     * @dev Transfers to an adresse a quantity contract's balance
     * Can only be called by the current owner
     */
    function _widthdraw(address _to, uint _quantity) private onlyOwner {
        require (address(this).balance < _quantity, "no enought balance");

        (bool success,) = _to.call{value: _quantity}("");
        require (success, "transfer failed");
        emit Widthdrawed(_msgSender(), _quantity);
    }

    /**
     * @dev Transfers to an adresse a quantity of contract's balance
     * Can only be called by the current owner
     */
    function widthdraw(address _address, uint _quantity) external onlyOwner {
        _widthdraw(_address, _quantity);
    }

    /**
     * @dev Transfers to an adresse all contract's balance
     * Can only be called by the current owner
     */
    function widthdraw(address _address) external onlyOwner {
        _widthdraw(_address, address(this).balance);
    }

    /**
     * @dev Transfers to the owner a quantity of contract's balance
     * Can only be called by the current owner
     */
    function widthdraw(uint _quantity) external onlyOwner {
        _widthdraw(_msgSender(), _quantity);
    }

    /**
     * @dev Transfers to the owner all contract's balance
     * Can only be called by the current owner
     */
    function widthdraw() external onlyOwner {
        _widthdraw(_msgSender(), address(this).balance);
    }
}