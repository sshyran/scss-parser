/*
Copyright (c) 2016, salesforce.com, inc. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/* global describe, it */

const { expect } = require('chai')
const { createAST, parse } = require('./helpers')

describe('Parser', () => {
  it('requires an InputStream', () => {
    expect(() => {
      parse()
    }).to.throw(/TokenStream/)
  })
  it('returns an AST', () => {
    let actual = createAST('a')
    let expected = {
      type: 'stylesheet',
      value: [{
        type: 'identifier',
        value: 'a'
      }]
    }
    expect(actual).to.deep.equal(expected)
  })
  describe('function', () => {
    it('no args', () => {
      let actual = createAST('fn()')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'function',
          value: [{
            type: 'identifier',
            value: 'fn'
          }, {
            type: 'arguments',
            value: []
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('1 arg', () => {
      let actual = createAST('fn($a)')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'function',
          value: [{
            type: 'identifier',
            value: 'fn'
          }, {
            type: 'arguments',
            value: [{
              type: 'variable',
              value: 'a'
            }]
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('2 args', () => {
      let actual = createAST('fn($a, $b)')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'function',
          value: [{
            type: 'identifier',
            value: 'fn'
          }, {
            type: 'arguments',
            value: [{
              type: 'variable',
              value: 'a'
            }, {
              type: 'punctuation',
              value: ','
            }, {
              type: 'space',
              value: ' '
            }, {
              type: 'variable',
              value: 'b'
            }]
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('function as the caller', () => {
      let actual = createAST('hello(world($a))')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'function',
          value: [{
            type: 'identifier',
            value: 'hello'
          }, {
            type: 'arguments',
            value: [{
              type: 'function',
              value: [{
                type: 'identifier',
                value: 'world'
              }, {
                type: 'arguments',
                value: [{
                  type: 'variable',
                  value: 'a'
                }]
              }]
            }]
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('interpolation as the caller', () => {
      let actual = createAST('#{hello}($a)')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'function',
          value: [{
            type: 'interpolation',
            value: [{
              type: 'identifier',
              value: 'hello'
            }]
          }, {
            type: 'arguments',
            value: [{
              type: 'variable',
              value: 'a'
            }]
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
  })
  describe('interpolation', () => {
    it('1 var', () => {
      let actual = createAST('#{$a}')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'interpolation',
          value: [{
            type: 'variable',
            value: 'a'
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('nested', () => {
      let actual = createAST('#{#{$a}}')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'interpolation',
          value: [{
            type: 'interpolation',
            value: [{
              type: 'variable',
              value: 'a'
            }]
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
  })
  describe('parentheses', () => {
    it('1 var', () => {
      let actual = createAST('($a)')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'parentheses',
          value: [{
            type: 'variable',
            value: 'a'
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('nested', () => {
      let actual = createAST('(($a))')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'parentheses',
          value: [{
            type: 'parentheses',
            value: [{
              type: 'variable',
              value: 'a'
            }]
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
  })
  describe('attribute', () => {
    it('1 var', () => {
      let actual = createAST('[$a]')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'attribute',
          value: [{
            type: 'variable',
            value: 'a'
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('nested', () => {
      let actual = createAST('[[$a]]')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'attribute',
          value: [{
            type: 'attribute',
            value: [{
              type: 'variable',
              value: 'a'
            }]
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
  })
  describe('class', () => {
    it('identifier', () => {
      let actual = createAST('.hello')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'class',
          value: [{
            type: 'identifier',
            value: 'hello'
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('identifier + interpolation', () => {
      let actual = createAST('.hello-#{$a}')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'class',
          value: [{
            type: 'identifier',
            value: 'hello-'
          }, {
            type: 'interpolation',
            value: [{
              type: 'variable',
              value: 'a'
            }]
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('identifier + interpolation + identifier', () => {
      let actual = createAST('.hello-#{$a}-world')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'class',
          value: [{
            type: 'identifier',
            value: 'hello-'
          }, {
            type: 'interpolation',
            value: [{
              type: 'variable',
              value: 'a'
            }]
          }, {
            type: 'operator',
            value: '-'
          }, {
            type: 'identifier',
            value: 'world'
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('identifier + id', () => {
      let actual = createAST('.hello#world')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'class',
          value: [{
            type: 'identifier',
            value: 'hello'
          }]
        }, {
          type: 'id',
          value: [{
            type: 'identifier',
            value: 'world'
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
  })
  describe('id', () => {
    it('identifier', () => {
      let actual = createAST('#hello')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'id',
          value: [{
            type: 'identifier',
            value: 'hello'
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('identifier + interpolation', () => {
      let actual = createAST('#hello-#{$a}')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'id',
          value: [{
            type: 'identifier',
            value: 'hello-'
          }, {
            type: 'interpolation',
            value: [{
              type: 'variable',
              value: 'a'
            }]
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('interpolation', () => {
      let actual = createAST('##{$a}')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'id',
          value: [{
            type: 'interpolation',
            value: [{
              type: 'variable',
              value: 'a'
            }]
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
  })
  describe('declaration', () => {
    it('simple', () => {
      let actual = createAST('$color: red;')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'declaration',
          value: [{
            type: 'property',
            value: [{
              type: 'variable',
              value: 'color'
            }]
          }, {
            type: 'punctuation',
            value: ':'
          }, {
            type: 'value',
            value: [{
              type: 'space',
              value: ' '
            }, {
              type: 'identifier',
              value: 'red'
            }]
          }, {
            type: 'punctuation',
            value: ';'
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('complex', () => {
      let actual = createAST('$map: ("foo": "bar", "hello": rgba($a));')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'declaration',
          value: [{
            type: 'property',
            value: [{
              type: 'variable',
              value: 'map'
            }]
          }, {
            type: 'punctuation',
            value: ':'
          }, {
            type: 'value',
            value: [{
              type: 'space',
              value: ' '
            }, {
              type: 'parentheses',
              value: [{
                type: 'declaration',
                value: [{
                  type: 'property',
                  value: [{
                    type: 'string_double',
                    value: 'foo'
                  }]
                }, {
                  type: 'punctuation',
                  value: ':'
                }, {
                  type: 'value',
                  value: [{
                    type: 'space',
                    value: ' '
                  }, {
                    type: 'string_double',
                    value: 'bar'
                  }]
                }, {
                  type: 'punctuation',
                  value: ','
                }]
              }, {
                type: 'space',
                value: ' '
              }, {
                type: 'declaration',
                value: [{
                  type: 'property',
                  value: [{
                    type: 'string_double',
                    value: 'hello'
                  }]
                }, {
                  type: 'punctuation',
                  value: ':'
                }, {
                  type: 'value',
                  value: [{
                    type: 'space',
                    value: ' '
                  }, {
                    type: 'function',
                    value: [{
                      type: 'identifier',
                      value: 'rgba'
                    }, {
                      type: 'arguments',
                      value: [{
                        type: 'variable',
                        value: 'a'
                      }]
                    }]
                  }]
                }]
              }]
            }]
          }, {
            type: 'punctuation',
            value: ';'
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('trailing', () => {
      let actual = createAST('.a { padding: 1px { top: 2px; } }')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'rule',
          value: [{
            type: 'selector',
            value: [{
              type: 'class',
              value: [{
                type: 'identifier',
                value: 'a'
              }]
            }, {
              type: 'space',
              value: ' '
            }]
          }, {
            type: 'block',
            value: [{
              type: 'space',
              value: ' '
            }, {
              type: 'declaration',
              value: [{
                type: 'property',
                value: [{
                  type: 'identifier',
                  value: 'padding'
                }]
              }, {
                type: 'punctuation',
                value: ':'
              }, {
                type: 'value',
                value: [{
                  type: 'space',
                  value: ' '
                }, {
                  type: 'number',
                  value: '1'
                }, {
                  type: 'identifier',
                  value: 'px'
                }, {
                  type: 'space',
                  value: ' '
                }, {
                  type: 'block',
                  value: [{
                    type: 'space',
                    value: ' '
                  }, {
                    type: 'declaration',
                    value: [{
                      type: 'property',
                      value: [{
                        type: 'identifier',
                        value: 'top'
                      }]
                    }, {
                      type: 'punctuation',
                      value: ':'
                    }, {
                      type: 'value',
                      value: [{
                        type: 'space',
                        value: ' '
                      }, {
                        type: 'number',
                        value: '2'
                      }, {
                        type: 'identifier',
                        value: 'px'
                      }]
                    }, {
                      type: 'punctuation',
                      value: ';'
                    }]
                  }, {
                    type: 'space',
                    value: ' '
                  }]
                }]
              }]
            }, {
              type: 'space',
              value: ' '
            }]
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('trailing 2', () => {
      let actual = createAST('padding: 1px { top: 2px; }')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'declaration',
          value: [{
            type: 'property',
            value: [{
              type: 'identifier',
              value: 'padding'
            }]
          }, {
            type: 'punctuation',
            value: ':'
          }, {
            type: 'value',
            value: [{
              type: 'space',
              value: ' '
            }, {
              type: 'number',
              value: '1'
            }, {
              type: 'identifier',
              value: 'px'
            }, {
              type: 'space',
              value: ' '
            }, {
              type: 'block',
              value: [{
                type: 'space',
                value: ' '
              }, {
                type: 'declaration',
                value: [{
                  type: 'property',
                  value: [{
                    type: 'identifier',
                    value: 'top'
                  }]
                }, {
                  type: 'punctuation',
                  value: ':'
                }, {
                  type: 'value',
                  value: [{
                    type: 'space',
                    value: ' '
                  }, {
                    type: 'number',
                    value: '2'
                  }, {
                    type: 'identifier',
                    value: 'px'
                  }]
                }, {
                  type: 'punctuation',
                  value: ';'
                }]
              }, {
                type: 'space',
                value: ' '
              }]
            }]
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
  })
  describe('rule', () => {
    it('1 selector', () => {
      let actual = createAST('.a {}')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'rule',
          value: [{
            type: 'selector',
            value: [{
              type: 'class',
              value: [{
                type: 'identifier',
                value: 'a'
              }]
            }, {
              type: 'space',
              value: ' '
            }]
          }, {
            type: 'block',
            value: []
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('1 selector 1 declaration', () => {
      let actual = createAST('.a { color: red; }')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'rule',
          value: [{
            type: 'selector',
            value: [{
              type: 'class',
              value: [{
                type: 'identifier',
                value: 'a'
              }]
            }, {
              type: 'space',
              value: ' '
            }]
          }, {
            type: 'block',
            value: [{
              type: 'space',
              value: ' '
            }, {
              type: 'declaration',
              value: [{
                type: 'property',
                value: [{
                  type: 'identifier',
                  value: 'color'
                }]
              }, {
                type: 'punctuation',
                value: ':'
              }, {
                type: 'value',
                value: [{
                  type: 'space',
                  value: ' '
                }, {
                  type: 'identifier',
                  value: 'red'
                }]
              }, {
                type: 'punctuation',
                value: ';'
              }]
            }, {
              type: 'space',
              value: ' '
            }]
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('1 selector 1 declaration 1 nested selector 1 declaration', () => {
      let actual = createAST('.a { color: red; .b { color: blue; } }')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'rule',
          value: [{
            type: 'selector',
            value: [{
              type: 'class',
              value: [{
                type: 'identifier',
                value: 'a'
              }]
            }, {
              type: 'space',
              value: ' '
            }]
          }, {
            type: 'block',
            value: [{
              type: 'space',
              value: ' '
            }, {
              type: 'declaration',
              value: [{
                type: 'property',
                value: [{
                  type: 'identifier',
                  value: 'color'
                }]
              }, {
                type: 'punctuation',
                value: ':'
              }, {
                type: 'value',
                value: [{
                  type: 'space',
                  value: ' '
                }, {
                  type: 'identifier',
                  value: 'red'
                }]
              }, {
                type: 'punctuation',
                value: ';'
              }]
            }, {
              type: 'space',
              value: ' '
            }, {
              type: 'rule',
              value: [{
                type: 'selector',
                value: [{
                  type: 'class',
                  value: [{
                    type: 'identifier',
                    value: 'b'
                  }]
                }, {
                  type: 'space',
                  value: ' '
                }]
              }, {
                type: 'block',
                value: [{
                  type: 'space',
                  value: ' '
                }, {
                  type: 'declaration',
                  value: [{
                    type: 'property',
                    value: [{
                      type: 'identifier',
                      value: 'color'
                    }]
                  }, {
                    type: 'punctuation',
                    value: ':'
                  }, {
                    type: 'value',
                    value: [{
                      type: 'space',
                      value: ' '
                    }, {
                      type: 'identifier',
                      value: 'blue'
                    }]
                  }, {
                    type: 'punctuation',
                    value: ';'
                  }]
                }, {
                  type: 'space',
                  value: ' '
                }]
              }]
            }, {
              type: 'space',
              value: ' '
            }]
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('trailing ";"', () => {
      let actual = createAST('.a {}; .b {}')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'rule',
          value: [{
            type: 'selector',
            value: [{
              type: 'class',
              value: [{
                type: 'identifier',
                value: 'a'
              }]
            }, {
              type: 'space',
              value: ' '
            }]
          }, {
            type: 'block',
            value: []
          }]
        }, {
          type: 'space',
          value: ' '
        }, {
          type: 'rule',
          value: [{
            type: 'selector',
            value: [{
              type: 'class',
              value: [{
                type: 'identifier',
                value: 'b'
              }]
            }, {
              type: 'space',
              value: ' '
            }]
          }, {
            type: 'block',
            value: []
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('1 pseudo class', () => {
      let actual = createAST(':hover {}')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'rule',
          value: [{
            type: 'selector',
            value: [{
              type: 'pseudo_class',
              value: [{
                type: 'identifier',
                value: 'hover'
              }]
            }, {
              type: 'space',
              value: ' '
            }]
          }, {
            type: 'block',
            value: []
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('1 class 2 pseudo classes', () => {
      let actual = createAST('.a:hover:active {}')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'rule',
          value: [{
            type: 'selector',
            value: [{
              type: 'class',
              value: [{
                type: 'identifier',
                value: 'a'
              }]
            }, {
              type: 'pseudo_class',
              value: [{
                type: 'identifier',
                value: 'hover'
              }]
            }, {
              type: 'pseudo_class',
              value: [{
                type: 'identifier',
                value: 'active'
              }]
            }, {
              type: 'space',
              value: ' '
            }]
          }, {
            type: 'block',
            value: []
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('1 class 2 pseudo classes 1 interpolation', () => {
      let actual = createAST('.a:hover:#{active} {}')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'rule',
          value: [{
            type: 'selector',
            value: [{
              type: 'class',
              value: [{
                type: 'identifier',
                value: 'a'
              }]
            }, {
              type: 'pseudo_class',
              value: [{
                type: 'identifier',
                value: 'hover'
              }]
            }, {
              type: 'pseudo_class',
              value: [{
                type: 'interpolation',
                value: [{
                  type: 'identifier',
                  value: 'active'
                }]
              }]
            }, {
              type: 'space',
              value: ' '
            }]
          }, {
            type: 'block',
            value: []
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('2 classes 2 pseudo classes', () => {
      let actual = createAST('.a:hover, .a:active {}')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'rule',
          value: [{
            type: 'selector',
            value: [{
              type: 'class',
              value: [{
                type: 'identifier',
                value: 'a'
              }]
            }, {
              type: 'pseudo_class',
              value: [{
                type: 'identifier',
                value: 'hover'
              }]
            }, {
              type: 'punctuation',
              value: ','
            }, {
              type: 'space',
              value: ' '
            }, {
              type: 'class',
              value: [{
                type: 'identifier',
                value: 'a'
              }]
            }, {
              type: 'pseudo_class',
              value: [{
                type: 'identifier',
                value: 'active'
              }]
            }, {
              type: 'space',
              value: ' '
            }]
          }, {
            type: 'block',
            value: []
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('2 classes 2 pseudo classes', () => {
      let actual = createAST('li:hover[data-foo=bar] {}')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'rule',
          value: [{
            type: 'selector',
            value: [{
              type: 'identifier',
              value: 'li'
            }, {
              type: 'pseudo_class',
              value: [{
                type: 'identifier',
                value: 'hover'
              }]
            }, {
              type: 'attribute',
              value: [{
                type: 'identifier',
                value: 'data-foo'
              }, {
                type: 'operator',
                value: '='
              }, {
                type: 'identifier',
                value: 'bar'
              }]
            }, {
              type: 'space',
              value: ' '
            }]
          }, {
            type: 'block',
            value: []
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('nested pseudo classes', () => {
      let actual = createAST('li:a(:b) {}')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'rule',
          value: [{
            type: 'selector',
            value: [{
              type: 'identifier',
              value: 'li'
            }, {
              type: 'function',
              value: [{
                type: 'pseudo_class',
                value: [{
                  type: 'identifier',
                  value: 'a'
                }]
              }, {
                type: 'arguments',
                value: [{
                  type: 'pseudo_class',
                  value: [{
                    type: 'identifier',
                    value: 'b'
                  }]
                }]
              }]
            }, {
              type: 'space',
              value: ' '
            }]
          }, {
            type: 'block',
            value: []
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('nested pseudo classes (with identifier)', () => {
      let actual = createAST('li:a(item:b) {}')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'rule',
          value: [{
            type: 'selector',
            value: [{
              type: 'identifier',
              value: 'li'
            }, {
              type: 'function',
              value: [{
                type: 'pseudo_class',
                value: [{
                  type: 'identifier',
                  value: 'a'
                }]
              }, {
                type: 'arguments',
                value: [{
                  type: 'identifier',
                  value: 'item'
                }, {
                  type: 'pseudo_class',
                  value: [{
                    type: 'identifier',
                    value: 'b'
                  }]
                }]
              }]
            }, {
              type: 'space',
              value: ' '
            }]
          }, {
            type: 'block',
            value: []
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('1 pseudo class 1 declaration (no space)', () => {
      let actual = createAST('li:hover { color:red; }')
      let expected = {
        type: 'stylesheet',
        value: [ {
          type: 'rule',
          value: [{
            type: 'selector',
            value: [{
              type: 'identifier',
              value: 'li'
            }, {
              type: 'pseudo_class',
              value: [{
                type: 'identifier',
                value: 'hover'
              }]
            }, {
              type: 'space',
              value: ' '
            }]
          }, {
            type: 'block',
            value: [{
              type: 'space',
              value: ' '
            }, {
              type: 'declaration',
              value: [{
                type: 'property',
                value: [{
                  type: 'identifier',
                  value: 'color'
                }]
              }, {
                type: 'punctuation',
                value: ':'
              }, {
                type: 'value',
                value: [{
                  type: 'identifier',
                  value: 'red'
                }]
              }, {
                type: 'punctuation',
                value: ';'
              }]
            }, {
              type: 'space',
              value: ' '
            }]
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('1 pseudo class 1 declaration 1 nested declaration', () => {
      let actual = createAST('li:hover { color: red { alt: blue; } }')
      let expected = {
        type: 'stylesheet',
        value: [ {
          type: 'rule',
          value: [{
            type: 'selector',
            value: [{
              type: 'identifier',
              value: 'li'
            }, {
              type: 'pseudo_class',
              value: [{
                type: 'identifier',
                value: 'hover'
              }]
            }, {
              type: 'space',
              value: ' '
            }]
          }, {
            type: 'block',
            value: [{
              type: 'space',
              value: ' '
            }, {
              type: 'declaration',
              value: [{
                type: 'property',
                value: [{
                  type: 'identifier',
                  value: 'color'
                }]
              }, {
                type: 'punctuation',
                value: ':'
              }, {
                type: 'value',
                value: [{
                  type: 'space',
                  value: ' '
                }, {
                  type: 'identifier',
                  value: 'red'
                }, {
                  type: 'space',
                  value: ' '
                }, {
                  type: 'block',
                  value: [{
                    type: 'space',
                    value: ' '
                  }, {
                    type: 'declaration',
                    value: [{
                      type: 'property',
                      value: [{
                        type: 'identifier',
                        value: 'alt'
                      }]
                    }, {
                      type: 'punctuation',
                      value: ':'
                    }, {
                      type: 'value',
                      value: [{
                        type: 'space',
                        value: ' '
                      }, {
                        type: 'identifier',
                        value: 'blue'
                      }]
                    }, {
                      type: 'punctuation',
                      value: ';'
                    }]
                  }, {
                    type: 'space',
                    value: ' '
                  }]
                }]
              }]
            }, {
              type: 'space',
              value: ' '
            }]
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('1 pseudo class 1 declaration (no space) 1 nested declaration', () => {
      let actual = createAST('li:hover { color:red { alt:blue; } }')
      let expected = {
        type: 'stylesheet',
        value: [ {
          type: 'rule',
          value: [{
            type: 'selector',
            value: [{
              type: 'identifier',
              value: 'li'
            }, {
              type: 'pseudo_class',
              value: [{
                type: 'identifier',
                value: 'hover'
              }]
            }, {
              type: 'space',
              value: ' '
            }]
          }, {
            type: 'block',
            value: [{
              type: 'space',
              value: ' '
            }, {
              type: 'rule',
              value: [{
                type: 'selector',
                value: [{
                  type: 'identifier',
                  value: 'color'
                }, {
                  type: 'pseudo_class',
                  value: [{
                    type: 'identifier',
                    value: 'red'
                  }]
                }, {
                  type: 'space',
                  value: ' '
                }]
              }, {
                type: 'block',
                value: [{
                  type: 'space',
                  value: ' '
                }, {
                  type: 'declaration',
                  value: [{
                    type: 'property',
                    value: [{
                      type: 'identifier',
                      value: 'alt'
                    }]
                  }, {
                    type: 'punctuation',
                    value: ':'
                  }, {
                    type: 'value',
                    value: [{
                      type: 'identifier',
                      value: 'blue'
                    }]
                  }, {
                    type: 'punctuation',
                    value: ';'
                  }]
                }, {
                  type: 'space',
                  value: ' '
                }]
              }]
            }, {
              type: 'space',
              value: ' '
            }]
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
  })
  describe('atrule', () => {
    it('include 0 args', () => {
      let actual = createAST('@include myMixin;')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'atrule',
          value: [{
            type: 'atkeyword',
            value: 'include'
          }, {
            type: 'space',
            value: ' '
          }, {
            type: 'identifier',
            value: 'myMixin'
          }, {
            type: 'punctuation',
            value: ';'
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('include 1 required arg', () => {
      let actual = createAST('@include myMixin($a);')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'atrule',
          value: [{
            type: 'atkeyword',
            value: 'include'
          }, {
            type: 'space',
            value: ' '
          }, {
            type: 'identifier',
            value: 'myMixin'
          }, {
            type: 'arguments',
            value: [{
              type: 'variable',
              value: 'a'
            }]
          }, {
            type: 'punctuation',
            value: ';'
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('include 1 required arg 1 optional arg', () => {
      let actual = createAST('@include myMixin($a, $b: null);')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'atrule',
          value: [{
            type: 'atkeyword',
            value: 'include'
          }, {
            type: 'space',
            value: ' '
          }, {
            type: 'identifier',
            value: 'myMixin'
          }, {
            type: 'arguments',
            value: [{
              type: 'variable',
              value: 'a'
            }, {
              type: 'punctuation',
              value: ','
            }, {
              type: 'space',
              value: ' '
            }, {
              type: 'declaration',
              value: [{
                type: 'property',
                value: [{
                  type: 'variable',
                  value: 'b'
                }]
              }, {
                type: 'punctuation',
                value: ':'
              }, {
                type: 'value',
                value: [{
                  type: 'space',
                  value: ' '
                }, {
                  type: 'identifier',
                  value: 'null'
                }]
              }]
            }]
          }, {
            type: 'punctuation',
            value: ';'
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('include 1 required arg 1 optional arg (complex)', () => {
      let actual = createAST('@include myMixin($a, $b: rgba($c) + 1);')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'atrule',
          value: [{
            type: 'atkeyword',
            value: 'include'
          }, {
            type: 'space',
            value: ' '
          }, {
            type: 'identifier',
            value: 'myMixin'
          }, {
            type: 'arguments',
            value: [{
              type: 'variable',
              value: 'a'
            }, {
              type: 'punctuation',
              value: ','
            }, {
              type: 'space',
              value: ' '
            }, {
              type: 'declaration',
              value: [{
                type: 'property',
                value: [{
                  type: 'variable',
                  value: 'b'
                }]
              }, {
                type: 'punctuation',
                value: ':'
              }, {
                type: 'value',
                value: [{
                  type: 'space',
                  value: ' '
                }, {
                  type: 'function',
                  value: [{
                    type: 'identifier',
                    value: 'rgba'
                  }, {
                    type: 'arguments',
                    value: [{
                      type: 'variable',
                      value: 'c'
                    }]
                  }]
                }, {
                  type: 'space',
                  value: ' '
                }, {
                  type: 'operator',
                  value: '+'
                }, {
                  type: 'space',
                  value: ' '
                }, {
                  type: 'number',
                  value: '1'
                }]
              }]
            }]
          }, {
            type: 'punctuation',
            value: ';'
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('mixin 0 args', () => {
      let actual = createAST('@mixin myMixin { }')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'atrule',
          value: [{
            type: 'atkeyword',
            value: 'mixin'
          }, {
            type: 'space',
            value: ' '
          }, {
            type: 'identifier',
            value: 'myMixin'
          }, {
            type: 'space',
            value: ' '
          }, {
            type: 'block',
            value: [{
              type: 'space',
              value: ' '
            }]
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('mixin 0 args 1 declaration', () => {
      let actual = createAST('@mixin myMixin { color: red; }')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'atrule',
          value: [{
            type: 'atkeyword',
            value: 'mixin'
          }, {
            type: 'space',
            value: ' '
          }, {
            type: 'identifier',
            value: 'myMixin'
          }, {
            type: 'space',
            value: ' '
          }, {
            type: 'block',
            value: [{
              type: 'space',
              value: ' '
            }, {
              type: 'declaration',
              value: [{
                type: 'property',
                value: [{
                  type: 'identifier',
                  value: 'color'
                }]
              }, {
                type: 'punctuation',
                value: ':'
              }, {
                type: 'value',
                value: [{
                  type: 'space',
                  value: ' '
                }, {
                  type: 'identifier',
                  value: 'red'
                }]
              }, {
                type: 'punctuation',
                value: ';'
              }]
            }, {
              type: 'space',
              value: ' '
            }]
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('mixin 1 required arg 1 declaration', () => {
      let actual = createAST('@mixin myMixin($a) { color: red; }')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'atrule',
          value: [{
            type: 'atkeyword',
            value: 'mixin'
          }, {
            type: 'space',
            value: ' '
          }, {
            type: 'identifier',
            value: 'myMixin'
          }, {
            type: 'arguments',
            value: [{
              type: 'variable',
              value: 'a'
            }]
          }, {
            type: 'space',
            value: ' '
          }, {
            type: 'block',
            value: [{
              type: 'space',
              value: ' '
            }, {
              type: 'declaration',
              value: [{
                type: 'property',
                value: [{
                  type: 'identifier',
                  value: 'color'
                }]
              }, {
                type: 'punctuation',
                value: ':'
              }, {
                type: 'value',
                value: [{
                  type: 'space',
                  value: ' '
                }, {
                  type: 'identifier',
                  value: 'red'
                }]
              }, {
                type: 'punctuation',
                value: ';'
              }]
            }, {
              type: 'space',
              value: ' '
            }]
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
    it('mixin 1 required arg 1 optional arg 1 declaration', () => {
      let actual = createAST('@mixin myMixin($a, $b: null) { color: red; }')
      let expected = {
        type: 'stylesheet',
        value: [{
          type: 'atrule',
          value: [{
            type: 'atkeyword',
            value: 'mixin'
          }, {
            type: 'space',
            value: ' '
          }, {
            type: 'identifier',
            value: 'myMixin'
          }, {
            type: 'arguments',
            value: [{
              type: 'variable',
              value: 'a'
            }, {
              type: 'punctuation',
              value: ','
            }, {
              type: 'space',
              value: ' '
            }, {
              type: 'declaration',
              value: [{
                type: 'property',
                value: [{
                  type: 'variable',
                  value: 'b'
                }]
              }, {
                type: 'punctuation',
                value: ':'
              }, {
                type: 'value',
                value: [{
                  type: 'space',
                  value: ' '
                }, {
                  type: 'identifier',
                  value: 'null'
                }]
              }]
            }]
          }, {
            type: 'space',
            value: ' '
          }, {
            type: 'block',
            value: [{
              type: 'space',
              value: ' '
            }, {
              type: 'declaration',
              value: [{
                type: 'property',
                value: [{
                  type: 'identifier',
                  value: 'color'
                }]
              }, {
                type: 'punctuation',
                value: ':'
              }, {
                type: 'value',
                value: [{
                  type: 'space',
                  value: ' '
                }, {
                  type: 'identifier',
                  value: 'red'
                }]
              }, {
                type: 'punctuation',
                value: ';'
              }]
            }, {
              type: 'space',
              value: ' '
            }]
          }]
        }]
      }
      expect(actual).to.deep.equal(expected)
    })
  })
  describe('sink', () => {
    it('works', () => {
      let scss = `
      $base-font-family: 'ProximaNova' !default;
      @mixin font-face($font-family, $file-name, $baseurl, $weight: 500, $style: normal ){
        @font-face {
          font: {
            family: $font-family;
            weight: $weight;
            style: $style;
          }
          src: url( $baseurl + $file-name + '.eot');
          src: url( $baseurl + $file-name + '.eot?#iefix') format('embedded-opentype');
          src: url( $baseurl + $file-name + '.woff') format('woff'),
                 url( $baseurl + $file-name + '.woff2') format('woff2'),
                 url( $baseurl + $file-name + '.ttf') format('truetype'),
                 url( $baseurl + $file-name + '.svg' + '#' + $file-name) format('svg');
        }
      }
      `
      createAST(scss)
    })
  })
})
