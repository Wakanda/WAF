/*
* This file is part of Wakanda software, licensed by 4D under
*  (i) the GNU General Public License version 3 (GNU GPL v3), or
*  (ii) the Affero General Public License version 3 (AGPL v3) or
*  (iii) a commercial license.
* This file remains the exclusive property of 4D and/or its licensors
* and is protected by national and international legislations.
* In any event, Licensee's compliance with the terms and conditions
* of the applicable license constitutes a prerequisite to any use of this file.
* Except as otherwise expressly stated in the applicable license,
* such license does not include any other license or rights on this file,
* 4D's and/or its licensors' trademarks and/or other proprietary rights.
* Consequently, no title, copyright or other proprietary rights
* other than those specified in the applicable license is granted.
*/
// ================== <Selection>
// All numbers are supposed to be >= 0
WAF.Selection = function WafSelection(inMode, singleRow)
{
	var		_mode		= 'multiple', // 'single', 'none'
			
			_rows		= [], // array of number of selected rows
			_ranges		= [], // array of {start: nn, ens: nn}
			_butRows	= [], // array of numbers of excluded rows
			
			// Quick accessors
			_isModeMultiple	= true,
			_isModeSingle	= false,
			_isModeNone		= false;

	// ========================== <private>
	// Utility, internal. Returns true if inNum is in the range *and* not in _butRows
	function _isInRanges(inNum)
	{
		var el;
		
		if(arguments.length > 0)
		{
			for(var i = 0, max = _ranges.length; i < max; ++i)
			{
				el = _ranges[i];
				if( inNum >= el.start && inNum <= el.end )
				{
					return _butRows.indexOf(inNum) < 0;
				}
			}
		}
		return false;
	}
	
	function _realignParam(inP, inValue)
	{
		if(typeof inP === 'undefined' || inP === null)
		{
			return inValue;
		}
		
		return inP;
	}
	
	function _removeNullsFromArray(inArray)
	{
		var idx = -1;
		if(inArray.length > 0)
		{
			do {
				idx = inArray.indexOf(null);
				if(idx > -1) {
					inArray.splice(idx, 1);
				}
			} while(idx > -1);
		}
	}
	
	function _cleanupArrays()
	{
		var idx = -1, temp, el, elNext, newStart, newEnd, ok, max, val;
		
		_removeNullsFromArray(_butRows);
		_removeNullsFromArray(_rows);
		
		max = _ranges.length;
		if(max > 1)
		{
			_ranges.sort( function(a, b) {
				return a.start - b.start;
			});
			
			temp = [];
			idx = 0;
			do {
				if(idx < max) {
					el = _ranges[idx];
				}
				
				newStart = el.start;
				newEnd = el.end;
				ok = true;
				do {
					++idx;
					if(idx < max) {
						elNext = _ranges[idx];
					} else {
						elNext = null;
					}
					if(elNext !== null && elNext.start <= newEnd) {
						newEnd = newEnd > elNext.end ? newEnd : elNext.end;
					} else {
						ok = false;
						--idx;
					}
				} while(ok && idx < max && elNext !== null);
				temp.push({start: newStart, end: newEnd} );
				
				++idx;
			} while(idx < max);
			
			_ranges = temp;
		}
		// Remove rows that are already in the ranges
		if( _ranges.length > 0)
		{
			for(var i = 0, max = _rows.length; i < max; ++i)
			{
				val = _rows[i];
				for(var j = 0, maxR = _ranges.length; j < maxR; ++j)
				{
					el = _ranges[ j ];
					if( val >= el.start && val <= el.end )
					{
						_rows[i] = null;
					}
				}
			}
			_removeNullsFromArray(_rows);
		}
	}
	
	function _clearArrays()
	{
		_rows = [];
	 	_ranges = [];
	 	_butRows = [];
	}
	// ========================== </private>
	

	// =====================================
	 this.prepareToSend = function()
	 {
	 	_cleanupArrays();
	 	var result = { 
			_mode: _isModeSingle ? "single" : "multiple",
			_rows: _rows, 
			_ranges: _ranges, 
			_butRows:_butRows 
		};
		return result;
	 }
	 
	// =====================================
	 this.getMode = function()
	 {
	 	return _mode;
	 }
	 
	 this.isModeMultiple = function()
	 {
	 	return _isModeMultiple;
	 }
	 
	 this.isModeSingle = function()
	 {
	 	return _isModeSingle;
	 }
	 
	 this.isModeNone = function()
	 {
	 	return _isModeNone;
	 }
	 
	// =====================================
	 this.reset = function(inMode)
	 {
	 	if(typeof inMode !== 'string') {
	 		inMode = _mode;
	 	}
	 	
	 	_isModeMultiple = false;
	 	_isModeSingle = false;
	 	_isModeNone = false;
	 	
	 	switch(inMode)
	 	{
	 	case 'single':
	 		_isModeSingle = true;
	 		_mode = inMode;
	 		break;
	 		
	 	case 'none':
	 		_isModeNone = false;
	 		_mode = inMode;
	 		break;
	 	
	 	default:
	 		_isModeMultiple = true;
	 		_mode = 'multiple';
	 		break;
	 	}
	 	
	 	_clearArrays();
	 	
	 	return this;
	 }
	 
	// =====================================
	 this.isSelected = function(inNum)
	 {
	 	if(!_isModeNone && arguments.length > 0)
	 	{
			if(_isModeSingle)
			{
				if(_rows.length > 0) {
					return _rows[0] === inNum;
				}
			}
			else
			{
				if(_rows.indexOf(inNum) > -1) {
					return _butRows.indexOf(inNum) < 0;
				}
				
				return _isInRanges(inNum);
			}
		}
	 	return false;
	 }
	 
	// =====================================
	 this.select = function(inNum, inAddToSel)
	 {
	 	var idx;
	 	
	 	if(!_isModeNone && arguments.length > 0 && inNum >= 0)
	 	{
			if(_isModeSingle)
			{
				_rows[0] = inNum;
			}
			else if(!inAddToSel) // falsy
			{
				_clearArrays();
				_rows[0] = inNum;
			}
			else
			{
				idx = _butRows.indexOf(inNum);
				if(idx > -1)
				{
					_butRows[idx] = null;
				}
				
				if(!_isInRanges(inNum) && _rows.indexOf(inNum) < 0)
				{
					_rows.push(inNum);
				}
			}
	 	}
	 	
	 	return this;
	 }
	 
	// =====================================
	this.selectRange = function(inFirst, inLast, inAddToSel)
	{
		var count, butCount, idx, val;
		
		if(!_isModeNone)
		{
			if(!inAddToSel) {
				_clearArrays();
			}
			if(inFirst >= 0 && inLast >= 0)
			{
				if(inFirst > inLast)
				{
					val = inFirst;
					inLast = inFirst;
					inLast = val;
				}
				
				if(_isModeSingle)
				{
					_rows[0] = inFirst;
				}
				else
				{
					count = inLast - inFirst + 1;
					butCount = _butRows.length;
					
					_ranges.push( {start: inFirst, end: inLast} );
					if(count < butCount)
					{
						for(var i = inFirst; i <= inLast; ++i)
						{
							idx = _butRows.indexOf(i);
							if(idx > -1) {
								_butRows[i] = null;
							}
						}
					}
					else
					{
						for(var i = 0; i < butCount; ++i)
						{
							val = _butRows[i];
							if(val >= inFirst && val <= inLast) {
								_butRows[i] = null;
							}
						}
					}
				}
			}
		}
		
		return this;
	}
	 
	// =====================================
	 this.toggle = function(inNum)
	 {
	 	var idxBut = -1, idxRow = -1, doSel;
	 	
	 	if(!_isModeNone && arguments.length > 0 && inNum >= 0)
	 	{
	 		if(_isModeSingle)
			{
				if(_rows.length > 0) {
					_rows = [];
				} else {
					_rows[0] = inNum;
				}
			}
			else
			{
				idxRow = _rows.indexOf(inNum);
				idxBut = _butRows.indexOf(inNum);
				
				if(idxBut > -1)
				{
					_butRows[idxBut] = null;
					
					if(idxRow < 0) {
						_rows.push(inNum);
					}
				}
				else
				{
					doSel = true;
					if(idxRow > -1) {
						_rows[idxRow] = null;
						doSel = false;
					}
					
					if( _isInRanges(inNum) ) {
						_butRows.push(inNum);
						doSel = false;
					}
					if(doSel) {
						_rows.push(inNum);
					}
				}
			}
	 	}
	 
	 	return this;
	 }
	 
	// =====================================
	this.countSelected = function()
	{
		var count = 0, el;
		
		if(_isModeNone)
		{
		}
		else if(_isModeSingle)
		{
			if(_rows.length > 0) {
				count = 1;
			}
		}
		else
		{
			_cleanupArrays();
			
			count = _rows.length;
			
			for(var i = 0, max = _ranges.length; i < max; ++i)
			{
				el = _ranges[i];
				count += el.end - el.start + 1;
			}
			
			count -= _butRows.length;
		}
		
		return count;
	}
	 
	// =====================================
	this.getSelectedRows = function()
	{
		var result = [], el, idx, curIdx;
		
		if(_isModeNone)
		{
		}
		else if(_isModeSingle)
		{
			if(_rows.length > 0) {
				result[0] = _rows[0];
			}
		}
		else
		{
			_cleanupArrays();
			
			idx = 0;
			for(var i = 0, max = _rows.length; i < max; ++i)
			{
				result[idx++] = _rows[i]; // faster than result.push(i)
			}
			
			for(var i = 0, maxRanges = _ranges.length; i < maxRanges; ++i)
			{
				el = _ranges[i];
				for(var j = el.start, max = el.end; j <= max; ++j)
				{
					result[idx++] = j;
				}
			}
			
			for(var i = 0, max = _butRows.length; i < max; ++i)
			{
				curIdx = result.indexOf(_butRows[i]);
				if(curIdx > -1) {
					result[curIdx] = null;
				}
			}
			
			_removeNullsFromArray(result);
		}
		
		return result;
	}
	
	// =====================================
	this.setSelectedRows = function(rowNumbers)
	{
		_clearArrays();
		var result = -1, el, idx, curIdx;
		
		if(_isModeNone)
		{
		}
		else if(_isModeSingle)
		{
			if(rowNumbers.length > 0) {
				result = rowNumbers[0];
				_rows.push(result);
			}
		}
		else
		{
			rowNumbers.sort(function(e1,e2)
			{
				if (e1 == e2)
					return 0;
				else if (e1 < e2)
					return -1;
				else return 1;
			});
			var startRange = null;
			var previousNum = null;
			
			function loopThrough(rownum)
			{
				if (startRange == null)
				{
					startRange = rownum;
				}
				else
				{
					if ((previousNum+1) !== rownum)
					{
						var endRange = previousNum;
						if (endRange === startRange)
						{
							_rows.push(startRange);
						}
						else
						{
							_ranges.push({start: startRange, end: endRange});
						}
						startRange = rownum;
					}
					else
					{
						// nothing to do
					}
				}
				previousNum = rownum;
			}
			
			if (rowNumbers.length > 0) {
				result = rowNumbers[0];
			}
				
			rowNumbers.forEach(loopThrough);
			loopThrough(null);
		}
		
		return result;
	}
	 
	// =====================================
	this.getFirst = function()
	{
		var firstsingle = -1;
		var firstrange = -1;
		
		if (_rows.length > 0)
			firstsingle = _rows[0];
		
		if (_ranges.length > 0)
			firstrange = _ranges[0].start;
		
		if (firstsingle == -1)
			if (firstrange == -1)
				return 0;
			else
				return firstrange;
		else
		{
			if (firstrange == -1)
				return firstsingle;
			else
			{
				if (firstsingle > firstrange)
					return firstrange;
				else
					return firstsingle;
			}
		}
	}
	
	this.getNext = function()
	{
		
	}

	// =====================================
	
	this.buildFromObject = function(obj)
	{
		this.reset(obj.mode)
		
		if (obj.rows != null)
			_rows = obj.rows;
		
		if (obj.butRows != null)
			_butRows = obj.butRows;
		
		if (obj.ranges != null)
			_ranges = obj.ranges;
		
	}


	// =====================================
	this.toString = function()
	{
		return this.getSelectedRows().join();
	}
	
	// =====================================
	// =====================================
	// First init
	
	if (typeof inMode == "object" && inMode.mode != null )
		this.buildFromObject(inMode);
	else
		this.reset(inMode);
	
	if (singleRow != null)
		_rows.push(singleRow);

}
// ================== </Selection>


